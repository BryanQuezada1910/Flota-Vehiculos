const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../data/vehicles.json');

const getVehicles = () => {
    const jsonData = fs.readFileSync(dataPath);
    return JSON.parse(jsonData);
};

const saveVehicles = (vehicles) => {
    const jsonData = JSON.stringify(vehicles, null, 4);
    fs.writeFileSync(dataPath, jsonData);
};

exports.getAllVehicles = (req, res) => {
    try {
        const vehicles = getVehicles();
        res.status(200).json(vehicles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addVehicle = (req, res) => {
    const vehicles = getVehicles();
    const newVehicle = req.body;
    vehicles.push(newVehicle);
    saveVehicles(vehicles);
    res.status(201).json(newVehicle);
};

exports.updateVehicle = (req, res) => {
    const vehicles = getVehicles();
    const vehicleId = parseInt(req.params.vehicle_id);
    const updatedVehicle = req.body;

    const index = vehicles.findIndex(v => v.id === vehicleId);
    if (index !== -1) {
        vehicles[index] = updatedVehicle;
        saveVehicles(vehicles);
        res.status(200).json(updatedVehicle);
    } else {
        res.status(404).json({ message: 'Vehicle not found' });
    }
};
