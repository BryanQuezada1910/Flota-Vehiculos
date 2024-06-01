const express = require('express');
const router = express.Router();
const vehicleController = require('../controladores/controladorVehiculo');

router.get('/', vehicleController.getAllVehicles);
router.post('/', vehicleController.addVehicle);
router.put('/:vehicle_id', vehicleController.updateVehicle);

module.exports = router;
