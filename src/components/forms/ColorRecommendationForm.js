// src/components/forms/ColorRecommendationForm.js
import React, { useState } from 'react';
import axios from 'axios';
import Loader from '../common/Loader';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useToast } from '../common/Toast';

const PREFERENCES = ['Blue', 'Red', 'Green', 'Yellow', 'Neutral', 'White'];
const LEVELS = ['Low', 'Medium', 'High'];
const REGIONS = ['Urban', 'Suburban', 'Rural', 'Coastal'];
const WEATHER = ['Sunny', 'Humid', 'Rainy', 'Dry', 'Snowy'];
const SURFACES = ['Concrete', 'Wood', 'Metal', 'Drywall'];
const CONDITIONS = ['Smooth', 'Rough', 'Cracked', 'Porous'];
const FINISHES = ['Matte', 'Glossy', 'Satin', 'Semi-Gloss'];
const METHODS = ['Brush', 'Roller', 'Spray'];

const ColorRecommendationForm = ({ onResult }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [form, setForm] = useState({
    colour_preference: '',
    area_traffic_level: '',
    maintenance_preference: '',
    region_type: '',
    user_budget_level: '',
    sun_exposure_level: '',
    application_method: '',
    recommended_finish: '',
    region: '',
    weather_condition: '',
    surface_type: '',
    durability_level: '',
    finish_type: '',
    surface_condition: '',
    coating_thickness_microns: '',
    temperature_c: '',
    humidity_level: '',
    number_of_coats: '',
    uv_exposure: '',
    rain_exposure: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const NumberInput = ({ label, name, placeholder }) => (
    <div className="form-group">
      <label className="form-label">{label} *</label>
      <input className="form-control" type="number" name={name} placeholder={placeholder} value={form[name]} onChange={handleChange} required />
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
        colour_preference: form.colour_preference,
        area_traffic_level: form.area_traffic_level,
        maintenance_preference: form.maintenance_preference,
        region_type: form.region_type,
        user_budget_level: form.user_budget_level,
        sun_exposure_level: form.sun_exposure_level,
        application_method: form.application_method,
        recommended_finish: form.recommended_finish,
        region: form.region,
        weather_condition: form.weather_condition,
        surface_type: form.surface_type,
        durability_level: form.durability_level,
        finish_type: form.finish_type,
        surface_condition: form.surface_condition,
        coating_thickness_microns: Number(form.coating_thickness_microns),
        temperature_c: Number(form.temperature_c),
        humidity_level: Number(form.humidity_level),
        number_of_coats: Number(form.number_of_coats),
        uv_exposure: Number(form.uv_exposure),
        rain_exposure: Number(form.rain_exposure)
      };

      const response = await axios.post('http://127.0.0.1:5000/api/model3', payload);
      const data = response.data;
      
      if (user?.uid) {
        try {
          await addDoc(collection(db, 'predictions'), {
            uid: user.uid,
            type: 'color_recommendation',
            role: 'user',
            input: payload,
            output: data,
            createdAt: serverTimestamp()
          });
        } catch {}
      }

      onResult(data);
      showToast('Recommendation ready!', 'success');
    } catch {
      setError('API request failed. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="alert alert-danger">⚠️ {error}</div>}
      <div className="grid-2">
        <SelectInput label="Colour Preference" name="colour_preference" options={PREFERENCES} />
        <SelectInput label="Area Traffic Level" name="area_traffic_level" options={LEVELS} />
        <SelectInput label="Maintenance Pref." name="maintenance_preference" options={LEVELS} />
        <SelectInput label="Region Type" name="region_type" options={REGIONS} />
        <SelectInput label="Budget Level" name="user_budget_level" options={LEVELS} />
        <SelectInput label="Sun Exposure" name="sun_exposure_level" options={LEVELS} />
        <SelectInput label="Application Method" name="application_method" options={METHODS} />
        <SelectInput label="Recommended Finish" name="recommended_finish" options={FINISHES} />
        <SelectInput label="Region" name="region" options={['Coastal', 'Inland', 'Mountain', 'Desert']} />
        <SelectInput label="Weather Condition" name="weather_condition" options={WEATHER} />
        <SelectInput label="Surface Type" name="surface_type" options={SURFACES} />
        <SelectInput label="Durability Level" name="durability_level" options={LEVELS} />
        <SelectInput label="Finish Type" name="finish_type" options={FINISHES} />
        <SelectInput label="Surface Condition" name="surface_condition" options={CONDITIONS} />
        
        <NumberInput label="Coating Thickness (µm)" name="coating_thickness_microns" placeholder="e.g. 120" />
        <NumberInput label="Temperature (°C)" name="temperature_c" placeholder="e.g. 32" />
        <NumberInput label="Humidity Level (%)" name="humidity_level" placeholder="e.g. 60" />
        <NumberInput label="Number of Coats" name="number_of_coats" placeholder="e.g. 2" />
        <NumberInput label="UV Exposure (%)" name="uv_exposure" placeholder="e.g. 50" />
        <NumberInput label="Rain Exposure (%)" name="rain_exposure" placeholder="e.g. 40" />
      </div>

      <button className="btn btn-primary btn-lg" style={{marginTop: 20, width: '100%'}} onClick={handleSubmit} disabled={loading}>
        {loading ? <Loader inline text="Fetching..." /> : '🎨 Get Recommendation →'}
      </button>
    </div>
  );
};
export default ColorRecommendationForm;