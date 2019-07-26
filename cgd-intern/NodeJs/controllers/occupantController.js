const express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;

var { Occupant } = require('../models/occupant');

// => localhost:3000/occupants/
router.get('/', (req, res) => {
    Occupant.find((err, docs) => {
        if (!err) { res.send(docs); }
        else { console.log('Error in Retriving Occupants :' + JSON.stringify(err, undefined, 2)); }
    });
});

router.get('/:id', (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send(`No record with given id : ${req.params.id}`);

        Occupant.findById(req.params.id, (err, doc) => {
            if (!err) { res.send(doc); }
            else { console.log('Error in Retriving Occupant :' + JSON.stringify(err, undefined, 2)); }
    });
});

router.post('/', (req, res) => {
    var occ = new Occupant({
        name: req.body.name,
        phone_number: req.body.phone_number,
        house_number: req.body.house_number,
        images: req.body.images,
        license_plate: req.body.license_plate
    });
    occ.save((err, doc) => {
        if (!err) { res.send(doc); }
        else { console.log('Error in Occupant Save :' + JSON.stringify(err, undefined, 2)); }
    });
});

router.put('/:id', (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send(`No record with given id : ${req.params.id}`);

    var occ = {
        name: req.body.name,
        phone_number: req.body.phone_number,
        house_number: req.body.house_number,
        images: req.body.images,
        license_plate: req.body.license_plate
    };
    Occupant.findByIdAndUpdate(req.params.id, { $set: occ }, { new: true }, (err, doc) => {
        if (!err) { res.send(doc); }
        else { console.log('Error in Occupant Update :' + JSON.stringify(err, undefined, 2)); }
    });
});

router.delete('/:id', (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send(`No record with given id : ${req.params.id}`);

        Occupant.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) { res.send(doc); }
        else { console.log('Error in Occupant Delete :' + JSON.stringify(err, undefined, 2)); }
    });
});

module.exports = router;