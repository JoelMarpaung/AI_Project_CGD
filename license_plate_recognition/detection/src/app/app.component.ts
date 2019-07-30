import { Component } from "@angular/core";
import * as tf from "@tensorflow/tfjs";
import { withSaveHandler } from "@tensorflow/tfjs-core/dist/io/io";
import { HttpParams } from "@angular/common/http";
import { HttpClient, HttpHeaders } from "@angular/common/http";

class Log {
  license_plate: string;
}
const params = new HttpParams().set("_page", "1").set("_limit", "1");
const headers = new HttpHeaders().set(
  "X-CustomHttpHeader",
  "Access-Control-Allow-Origin: true"
);
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  title =
    "Oject Detection and Recognition for License Plate using Tensorflow JS and OpenALPR";
  private video: HTMLVideoElement;
  private xVal;
  private yVal;
  private wVal;
  private hVal;
  private license_old: "unknown";

  constructor(private httpClient: HttpClient) {}

  ngOnInit() {
    this.webcam_init();
    this.predictWithModel();
  }

  public async predictWithModel() {
    const MODEL_URL = "/assets/model_web/";
    const LABELS_URL = MODEL_URL + "labels.json";
    const MODEL_JSON = MODEL_URL + "model.json";

    const modelPromise = tf.loadGraphModel(MODEL_JSON);
    const labelsPromise = fetch(LABELS_URL).then(data => data.json());

    Promise.all([modelPromise, labelsPromise])
      .then(values => {
        const [model, labels] = values;
        this.detectFrame(this.video, model, labels);
      })
      .catch(error => {
        console.error(error);
      });

    console.log("model loaded");
  }

  TFWrapper = model => {
    const calculateMaxScores = (scores, numBoxes, numClasses) => {
      const maxes = [];
      const classes = [];
      for (let i = 0; i < numBoxes; i++) {
        let max = Number.MIN_VALUE;
        let index = -1;
        for (let j = 0; j < numClasses; j++) {
          if (scores[i * numClasses + j] > max) {
            max = scores[i * numClasses + j];
            index = j;
          }
        }
        maxes[i] = max;
        classes[i] = index;
      }
      return [maxes, classes];
    };

    const buildDetectedObjects = (
      width,
      height,
      boxes,
      scores,
      indexes,
      classes
    ) => {
      const count = indexes.length;
      const objects = [];
      for (let i = 1; i < count; i++) {
        const bbox = [];
        for (let j = 0; j < 4; j++) {
          bbox[j] = boxes[indexes[i] * 4 + j];
        }
        const minY = bbox[0] * height;
        const minX = bbox[1] * width;
        const maxY = bbox[2] * height;
        const maxX = bbox[3] * width;
        bbox[0] = minX;
        bbox[1] = minY;
        bbox[2] = maxX - minX;
        bbox[3] = maxY - minY;
        objects.push({
          bbox: bbox,
          class: classes[indexes[i]],
          score: scores[indexes[i]]
        });
        console.log(scores[indexes[i]]);
      }
      // console.log(objects);
      return objects;
    };

    const detect = input => {
      const batched = tf.tidy(() => {
        const img = tf.browser.fromPixels(input);
        // Reshape to a single-element batch so we can pass it to executeAsync.
        return img.expandDims(0);
      });

      const height = batched.shape[1];
      const width = batched.shape[2];

      return model.executeAsync(batched).then(result => {
        const scores = result[0].dataSync();
        const boxes = result[1].dataSync();

        // clean the webgl tensors
        batched.dispose();
        tf.dispose(result);

        const [maxScores, classes] = calculateMaxScores(
          scores,
          result[0].shape[1],
          result[0].shape[2]
        );

        const prevBackend = tf.getBackend();
        // run post process in cpu
        tf.setBackend("cpu");
        const indexTensor = tf.tidy(() => {
          const boxes2 = tf.tensor2d(boxes, [
            result[1].shape[1],
            result[1].shape[3]
          ]);
          return tf.image.nonMaxSuppression(
            boxes2,
            maxScores,
            20, // maxNumBoxes
            0.5, // iou_threshold
            0.5 // score_threshold
          );
        });
        const indexes = indexTensor.dataSync();
        indexTensor.dispose();
        // restore previous backend
        tf.setBackend(prevBackend);

        return buildDetectedObjects(
          width,
          height,
          boxes,
          maxScores,
          indexes,
          classes
        );
      });
    };

    return {
      detect: detect
    };
  };

  webcam_init() {
    this.video = <HTMLVideoElement>document.getElementById("vid");

    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          facingMode: "user"
        }
      })
      .then(stream => {
        this.video.srcObject = stream;
        this.video.onloadedmetadata = () => {
          this.video.play();
        };
      });
  }

  detectFrame = (video, model, labels) => {
    this.TFWrapper(model)
      .detect(video)
      .then(predictions => {
        this.renderPredictions(predictions, labels);
        requestAnimationFrame(() => {
          setTimeout(() => {
            //<<<---    using ()=> syntax
            this.detectFrame(video, model, labels);
          }, 2000);
        });
      });
  };

  renderPredictions = (predictions, labels) => {
    const canvas = <HTMLCanvasElement>document.getElementById("canvas");

    const ctx = canvas.getContext("2d");

    canvas.width = this.video.width;
    canvas.height = this.video.height;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // Font options.
    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";
    ctx.drawImage(this.video, 0, 0, ctx.canvas.width, ctx.canvas.height);
    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];
      const label = labels[parseInt(prediction.class)];
      this.xVal = x;
      this.yVal = y;
      this.wVal = width;
      this.hVal = height;

      // Draw the bounding box.
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 2;
      ctx.strokeRect(this.xVal, this.yVal, width, height);
      // Draw the label background.
      ctx.fillStyle = "#00FFFF";
      const textWidth = ctx.measureText(label).width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);

      if (label == "license_plate") {
        this.capture();
      }
    });

    predictions.forEach(prediction => {
      const label = labels[parseInt(prediction.class)];
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      // Draw the text last to ensure it's on top.
      ctx.fillStyle = "#000000";
      ctx.fillText(label, x, y);
    });
  };

  public async capture() {
    const canvas = <HTMLCanvasElement>document.getElementById("canvasCapture");

    const ctx = canvas.getContext("2d");

    canvas.width = this.video.width;
    canvas.height = this.video.height;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // Font options.

    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";
    ctx.drawImage(this.video, 0, 0, ctx.canvas.width, ctx.canvas.height);

    var image = new Image();

    var license = canvas.toDataURL("image/jpg").substring(22);
    // console.log(license);

    var secret_key = "sk_6f91ddc4ca251ca73630872c";
    var url =
      "https://api.openalpr.com/v2/recognize_bytes?recognize_vehicle=1&country=id&secret_key=" +
      secret_key;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    var number = "unknown";
    // Send POST data and display response
    xhr.send(license);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        document.getElementById("response").innerHTML = xhr.responseText;
        var obj = JSON.parse(xhr.responseText);
        number = obj.results[0].plate;
        console.log(number);
        var license_plate = number;

        var abc = new XMLHttpRequest();
        abc.open("PUT", "http://localhost:3000/logs/unknown");
        abc.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        console.log(license_plate);
        abc.send(JSON.stringify({ license_plate: license_plate }));
      } else {
        document.getElementById("response").innerHTML =
          "Waiting on response...";
      }
    };
  }
}
