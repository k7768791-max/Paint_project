// src/components/forms/QualityPredictionForm.js
import React, { useState } from 'react';
import axios from 'axios';
import Loader from '../common/Loader';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useToast } from '../common/Toast';

const USAGE_TYPES = ['Exterior', 'Interior', 'Industrial', 'Marine'];
const GLOSS_LEVELS = ['High', 'Medium', 'Low', 'Matte'];
const COLORS = ['Ocean Blue', 'Crimson Red', 'Forest Green', 'Pure White', 'Jet Black'];

const QualityPredictionForm = ({ onResult }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [form, setForm] = useState({
    Temperature_C: '',
    Pressure_kPa: '',
    pH: '',
    Density_g_cm3: '',
    'Humidity_%': '',
    Drying_Time_min: '',
    Mixing_Speed_RPM: '',
    Mixing_Time_min: '',
    Batch_Size_L: '',
    Cooling_Time_min: '',
    Usage_Type: '',
    Gloss_Level: '',
    Color: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const NumberInput = ({ label, name, placeholder, step = 1 }) => (
    <div className="form-group">
      <label className="form-label">{label} *</label>
      <input
        className="form-control"
        type="number"
        name={name}
        placeholder={placeholder}
        step={step}
        value={form[name]}
        onChange={handleChange}
        required
      />
    </div>
  );

  const SelectInput = ({ label, name, options }) => (
    <div className="form-group">
      <label className="form-label">{label} *</label>
      <select className="form-control" name={name} value={form[name]} onChange={handleChange} required>
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const handleSubmit = async () => {
    if (Object.values(form).some(v => v === '')) {
      setError('Please fill all required fields.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const payload = {
        Temperature_C: Number(form.Temperature_C),
        Pressure_kPa: Number(form.Pressure_kPa),
        pH: Number(form.pH),
        Density_g_cm3: Number(form.Density_g_cm3),
        'Humidity_%': Number(form['Humidity_%']),
        Drying_Time_min: Number(form.Drying_Time_min),
        Mixing_Speed_RPM: Number(form.Mixing_Speed_RPM),
        Mixing_Time_min: Number(form.Mixing_Time_min),
        Batch_Size_L: Number(form.Batch_Size_L),
        Cooling_Time_min: Number(form.Cooling_Time_min),
        Usage_Type: form.Usage_Type,
        Gloss_Level: form.Gloss_Level,
        Color: form.Color
      };

      const response = await axios.post('http://127.0.0.1:5000/api/model2', payload);
      const data = response.data;
      
      const result = {
        viscosity: data.viscosity,
        purity: data.purity,
        suggestions: data.suggestions || [],
        input: payload
      };

      if (user?.uid) {
        try {
          await addDoc(collection(db, 'predictions'), {
            uid: user.uid,
            type: 'quality_prediction',
            role: 'manufacturer',
            input: payload,
            output: result,
            createdAt: serverTimestamp()
          });
        } catch { }
      }

      onResult(result);
      showToast('Quality prediction complete!', 'success');
    } catch (err) {
      setError('API request failed. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="alert alert-danger">⚠️ {error}</div>}
      <div className="grid-2">
        <NumberInput label="Temperature (°C)" name="Temperature_C" placeholder="e.g. 32" />
        <NumberInput label="Pressure (kPa)" name="Pressure_kPa" placeholder="e.g. 100" />
        <NumberInput label="pH Level" name="pH" placeholder="e.g. 7.2" step="0.1" />
        <NumberInput label="Density (g/cm³)" name="Density_g_cm3" placeholder="e.g. 1.25" step="0.01" />
        <NumberInput label="Humidity (%)" name="Humidity_%" placeholder="e.g. 60" />
        <NumberInput label="Drying Time (min)" name="Drying_Time_min" placeholder="e.g. 45" />
        <NumberInput label="Mixing Speed (RPM)" name="Mixing_Speed_RPM" placeholder="e.g. 500" />
        <NumberInput label="Mixing Time (min)" name="Mixing_Time_min" placeholder="e.g. 20" />
        <NumberInput label="Batch Size (L)" name="Batch_Size_L" placeholder="e.g. 100" />
        <NumberInput label="Cooling Time (min)" name="Cooling_Time_min" placeholder="e.g. 15" />
        <SelectInput label="Usage Type" name="Usage_Type" options={USAGE_TYPES} />
        <SelectInput label="Gloss Level" name="Gloss_Level" options={GLOSS_LEVELS} />
        <SelectInput label="Color" name="Color" options={COLORS} />
      </div>
      <button className="btn btn-primary btn-lg" style={{marginTop: 20}} onClick={handleSubmit} disabled={loading}>
        {loading ? <Loader inline text="Predicting..." /> : '⚗️ Predict Quality →'}
      </button>
    </div>
  );
};
export default QualityPredictionForm;