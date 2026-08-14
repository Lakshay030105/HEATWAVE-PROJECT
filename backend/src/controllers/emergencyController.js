// In-memory / DB state for Emergency Fleet Units (108 Ambulances, PHED Tankers, Mobile Clinics)
let EMERGENCY_UNITS = [
  { id: 'AMB-101', code: '108-JAI-NORTH', type: 'ambulance', baseStation: 'SMS Hospital Base', assignedWard: 'JPR-W03', status: 'on_scene', crew: 'Dr. Sharma + 1 EMT', lat: 26.905, lng: 75.802, etaMins: 0, battery: 94 },
  { id: 'AMB-102', code: '108-JAI-SOUTH', type: 'ambulance', baseStation: 'Mahatma Gandhi Hospital', assignedWard: 'JPR-W05', status: 'dispatched', crew: 'EMT Verma + Driver', lat: 26.808, lng: 75.795, etaMins: 4, battery: 88 },
  { id: 'AMB-103', code: '108-JAI-WEST', type: 'ambulance', baseStation: 'Vaishali Urban Clinic', assignedWard: null, status: 'available', crew: 'EMT Rathore + Driver', lat: 26.912, lng: 75.742, etaMins: 0, battery: 100 },
  { id: 'TNK-201', code: 'PHED-TANKER-01', type: 'water_tanker', baseStation: 'Civil Lines Water Works', assignedWard: 'JPR-W02', status: 'dispatched', crew: 'Driver Kuldeep', lat: 26.862, lng: 75.762, etaMins: 8, capacityLiters: 10000 },
  { id: 'TNK-202', code: 'PHED-TANKER-02', type: 'water_tanker', baseStation: 'Bani Park Depot', assignedWard: null, status: 'available', crew: 'Driver Mohan', lat: 26.912, lng: 75.742, etaMins: 0, capacityLiters: 10000 },
  { id: 'CLINIC-301', code: 'HEAT-MOBILE-01', type: 'mobile_clinic', baseStation: 'Jaipur Nagar Nigam HQ', assignedWard: 'JPR-W05', status: 'on_scene', crew: '2 Nurses + ORS inventory', lat: 26.812, lng: 75.789, etaMins: 0, capacityTreated: 42 }
];

// GET /api/emergency/units
exports.getUnits = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: EMERGENCY_UNITS });
  } catch (err) {
    console.error('Error fetching emergency units:', err);
    res.status(500).json({ success: false, message: 'Server error fetching emergency units' });
    if (next) next(err);
  }
};

// POST /api/emergency/dispatch
exports.dispatchUnit = async (req, res, next) => {
  try {
    const { unitId, wardId } = req.body;
    if (!unitId || !wardId) {
      return res.status(400).json({ success: false, message: 'unitId and wardId are required' });
    }

    const unit = EMERGENCY_UNITS.find(u => u.id === unitId);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Emergency unit not found' });
    }

    unit.assignedWard = wardId;
    unit.status = 'dispatched';
    unit.etaMins = 5;

    res.status(200).json({
      success: true,
      unitId,
      wardId,
      status: 'dispatched',
      dispatchedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error dispatching emergency unit:', err);
    res.status(500).json({ success: false, message: 'Server error dispatching unit' });
    if (next) next(err);
  }
};
