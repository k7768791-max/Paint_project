// src/components/forms/ManufacturerPredictionForm.js
import React, { useState } from 'react';
import axios from 'axios';
import Loader from '../common/Loader';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useToast } from '../common/Toast';

const PIGMENT_TYPES = ['Iron Oxide', 'Titanium Dioxide', 'Carbon Black', 'Ultramarine Blue', 'Chromium Oxide', 'Cadmium Yellow', 'Zinc White'];
const BASE_COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Brown', 'Orange'];
const ADDITIVE_TYPES = ['Stabilizer', 'Dispersant', 'Thickener', 'Anti-settling Agent', 'Biocide', 'None'];
const BINDER_TYPES = ['Acrylic', 'Alkyd', 'Epoxy', 'Polyurethane', 'Vinyl', 'Latex'];
const SOLVENT_TYPES = ['Water', 'Mineral Spirits', 'Turpentine', 'Xylene', 'Naphtha'];

const ManufacturerPredictionForm = ({ onResult }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    Pigment_Type: '',
    Pigment_Base_Color: '',
    'Pigment_%': '',
    Additive_Type: '',
    'Additive_%': '',
    Binder_Type: '',
    'Binder_%': '',
    Solvent_Type: '',
    'Solvent_%': '',
    Mixing_Temperature_C: '',
    pH_Level: '',
    Particle_Size_microns: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const required = ['Pigment_Type', 'Pigment_Base_Color', 'Pigment_%', 'Binder_Type', 'Binder_%', 'Solvent_Type', 'Solvent_%', 'Mixing_Temperature_C', 'pH_Level', 'Particle_Size_microns'];
    if (required.some(k => form[k] === '')) { setError('Please fill all required fields.'); return; }
    setLoading(true); setError('');

    try {
      const payload = {
        Pigment_Type: form.Pigment_Type,
        Pigment_Base_Color: form.Pigment_Base_Color,
        'Pigment_%': Number(form['Pigment_%']),
        Additive_Type: form.Additive_Type || 'None',
        'Additive_%': Number(form['Additive_%'] || 0),
        Binder_Type: form.Binder_Type,
        'Binder_%': Number(form['Binder_%']),
        Solvent_Type: form.Solvent_Type,
        'Solvent_%': Number(form['Solvent_%']),
        Mixing_Temperature_C: Number(form.Mixing_Temperature_C),
        pH_Level: Number(form.pH_Level),
        Particle_Size_microns: Number(form.Particle_Size_microns),
      };

      const response = await axios.post('http://127.0.0.1:5000/api/model1', payload);
      const raw = response.data;
      
      const result = {
        predicted_color: raw.predicted_color,
        input: payload,
      };

      if (user?.uid) {
        try {
          await addDoc(collection(db, 'predictions'), {
            uid: user.uid,
            type: 'manufacturer_color',
            role: 'manufacturer',
            input: payload,
            output: result,
            createdAt: serverTimestamp(),
          });
        } catch { }
      }

      onResult(result);
      showToast('🔬 Color prediction complete!', 'success');
    } catch {
      setError('Prediction failed. Ensure the Flask API is running.');
    } finally {
      setLoading(false);
    }
  };

  const NumberInput = ({ label, name, placeholder, min, max, step, required }) => (
    <div className="form-group">
      <label className="form-label">{label}{required && ' *'}</label>
      <input className="form-control" type="number" name={name} placeholder={placeholder} min={min} max={max} step={step || 1} value={form[name]} onChange={handleChange} />
    </div>
  );

  const SelectInput = ({ label, name, options, required }) => (
    <div className="form-group">
      <label className="form-label">{label}{required && ' *'}</label>
      <select className="form-control" name={name} value={form[name]} onChange={handleChange}>
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div>
      {error && <div className="alert alert-danger">⚠️ {error}</div>}
      <div className="grid-2">
        <SelectInput label="Pigment Type" name="Pigment_Type" options={PIGMENT_TYPES} required />
        <SelectInput label="Pigment Base Color" name="Pigment_Base_Color" options={BASE_COLORS} required />
        <NumberInput label="Pigment (%)" name="Pigment_%" placeholder="e.g. 24" required />
        <SelectInput label="Additive Type" name="Additive_Type" options={ADDITIVE_TYPES} />
        <NumberInput label="Additive (%)" name="Additive_%" placeholder="e.g. 4" />
        <SelectInput label="Binder Type" name="Binder_Type" options={BINDER_TYPES} required />
        <NumberInput label="Binder (%)" name="Binder_%" placeholder="e.g. 28" required />
        <SelectInput label="Solvent Type" name="Solvent_Type" options={SOLVENT_TYPES} required />
        <NumberInput label="Solvent (%)" name="Solvent_%" placeholder="e.g. 40" required />
        <NumberInput label="Mixing Temp (°C)" name="Mixing_Temperature_C" placeholder="e.g. 32" required />
        <NumberInput label="pH Level" name="pH_Level" placeholder="e.g. 7.1" step={0.1} required />
        <NumberInput label="Particle Size (µm)" name="Particle_Size_microns" placeholder="e.g. 14" required />
      </div>
      <button className="btn btn-primary btn-lg" style={{marginTop: 20}} onClick={handleSubmit} disabled={loading}>
        {loading ? <Loader inline text="Analyzing..." /> : '🔬 Predict Color →'}
      </button>
    </div>
  );
};
export default ManufacturerPredictionForm;