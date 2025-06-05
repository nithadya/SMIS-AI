import React, { useState } from 'react';
import { motion } from 'framer-motion';

const InquiryForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    program: '',
    source: '',
    counselor: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClasses = "w-full px-4 py-2 rounded-lg glass transition-all duration-200 focus:glow-sm text-secondary-700 dark:text-secondary-300 placeholder-secondary-400 dark:placeholder-secondary-600";
  const labelClasses = "block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1";

  return (
    <div className="card glass p-6">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className={labelClasses}>Full Name *</label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className={labelClasses}>Email *</label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className={labelClasses}>Phone Number *</label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>

          <div>
            <label htmlFor="program" className={labelClasses}>Program of Interest *</label>
            <motion.select
              whileFocus={{ scale: 1.01 }}
              id="program"
              name="program"
              value={formData.program}
              onChange={handleChange}
              className={inputClasses}
              required
            >
              <option value="">Select Program</option>
              <option value="it">Information Technology</option>
              <option value="business">Business Management</option>
              <option value="engineering">Engineering</option>
            </motion.select>
          </div>

          <div>
            <label htmlFor="source" className={labelClasses}>Source *</label>
            <motion.select
              whileFocus={{ scale: 1.01 }}
              id="source"
              name="source"
              value={formData.source}
              onChange={handleChange}
              className={inputClasses}
              required
            >
              <option value="">Select Source</option>
              <option value="web">Web Form</option>
              <option value="phone">Phone</option>
              <option value="email">Email</option>
              <option value="walk-in">Walk-in</option>
            </motion.select>
          </div>

          <div>
            <label htmlFor="counselor" className={labelClasses}>Assigned Counselor *</label>
            <motion.select
              whileFocus={{ scale: 1.01 }}
              id="counselor"
              name="counselor"
              value={formData.counselor}
              onChange={handleChange}
              className={inputClasses}
              required
            >
              <option value="">Select Counselor</option>
              <option value="sarah">Sarah Wilson</option>
              <option value="john">John Smith</option>
              <option value="mary">Mary Johnson</option>
            </motion.select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="notes" className={labelClasses}>Notes</label>
            <motion.textarea
              whileFocus={{ scale: 1.01 }}
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className={`${inputClasses} min-h-[100px] resize-y`}
              placeholder="Enter any additional notes or comments..."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium hover:glow-sm transition-all duration-200"
          >
            Create Inquiry
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default InquiryForm; 