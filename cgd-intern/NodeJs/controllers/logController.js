const express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;

var { Log } = require('../models/log');

// => localhost:3000/logs/
router.get('/', (req, res) => {
    Log.find((err, docs) => {
        if (!err) { res.send(docs); }
        else { console.log('Error in Retriving Logs :' + JSON.stringify(err, undefined, 2)); }
    });
});

router.get('/:id', (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send(`No record with given id : ${req.params.id}`);

        Log.findById(req.params.id, (err, doc) => {
            if (!err) { res.send(doc); }
            else { console.log('Error in Retriving Log :' + JSON.stringify(err, undefined, 2)); }
    });
});

router.post('/', (req, res) => {
    var lg = new Log({
        id_occupant: req.body.id_occupant,
        name: req.body.name,
        license_plate: req.body.license_plate,
        status: req.body.status,
        date: req.body.date
    });
    lg.save((err, doc) => {
        if (!err) { res.send(doc); }
        else { console.log('Error in Log Save :' + JSON.stringify(err, undefined, 2)); }
    });
});

router.put('/:id', (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send(`No record with given id : ${req.params.id}`);

    var lg = {
        id_occupant: req.body.id_occupant,
        name: req.body.name,
        license_plate: req.body.license_plate,
        status: req.body.status,
        date: req.body.date
    };
    Log.findByIdAndUpdate(req.params.id, { $set: lg }, { new: true }, (err, doc) => {
        if (!err) { res.send(doc); }
        else { console.log('Error in Log Update :' + JSON.stringify(err, undefined, 2)); }
    });
});

router.delete('/:id', (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send(`No record with given id : ${req.params.id}`);

        Log.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) { res.send(doc); }
        else { console.log('Error in Log Delete :' + JSON.stringify(err, undefined, 2)); }
    });
});

module.exports = router;