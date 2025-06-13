import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createInquiry, getPrograms, getSources, getCounselors } from '../../lib/api/inquiries';
import { showToast } from '../common/Toast';

const InquiryForm = ({ onSubmit, initialData = null, isEditing = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    program_id: '',
    source_id: '',
    counselor_id: '',
    notes: '',
    status: 'new'
  });

  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [sources, setSources] = useState([]);
  const [counselors, setCounselors] = useState([]);

  useEffect(() => {
    // Set initial form data if in edit mode
    if (isEditing && initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        program_id: initialData.program_id || '',
        source_id: initialData.source_id || '',
        counselor_id: initialData.counselor_id || '',
        notes: initialData.notes || '',
        status: initialData.status || 'new'
      });
    }
  }, [isEditing, initialData]);

  useEffect(() => {
    const fetchData = async () => {
      const [programsRes, sourcesRes, counselorsRes] = await Promise.all([
        getPrograms(),
        getSources(),
        getCounselors()
      ]);

      if (programsRes.data) setPrograms(programsRes.data);
      if (sourcesRes.data) setSources(sourcesRes.data);
      if (counselorsRes.data) setCounselors(counselorsRes.data);
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        // For editing, just pass the data to parent
        await onSubmit(formData);
      } else {
        // For new inquiry, use createInquiry
        const { data, error } = await createInquiry(formData);
        
        if (error) {
          showToast.error(error);
          return;
        }

        showToast.success('Inquiry created successfully');
        onSubmit(data);
        
        // Reset form only for new inquiries
        setFormData({
          name: '',
          email: '',
          phone: '',
          program_id: '',
          source_id: '',
          counselor_id: '',
          notes: '',
          status: 'new'
        });
      }
    } catch (error) {
      showToast.error(isEditing ? 'Failed to update inquiry' : 'Failed to create inquiry');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="program_id" className={labelClasses}>Program of Interest *</label>
            <motion.select
              whileFocus={{ scale: 1.01 }}
              id="program_id"
              name="program_id"
              value={formData.program_id}
              onChange={handleChange}
              className={inputClasses}
              required
              disabled={loading}
            >
              <option value="">Select Program</option>
              {programs.map(program => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </motion.select>
          </div>

          <div>
            <label htmlFor="source_id" className={labelClasses}>Source *</label>
            <motion.select
              whileFocus={{ scale: 1.01 }}
              id="source_id"
              name="source_id"
              value={formData.source_id}
              onChange={handleChange}
              className={inputClasses}
              required
              disabled={loading}
            >
              <option value="">Select Source</option>
              {sources.map(source => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </motion.select>
          </div>

          <div>
            <label htmlFor="counselor_id" className={labelClasses}>Assigned Counselor *</label>
            <motion.select
              whileFocus={{ scale: 1.01 }}
              id="counselor_id"
              name="counselor_id"
              value={formData.counselor_id}
              onChange={handleChange}
              className={inputClasses}
              required
              disabled={loading}
            >
              <option value="">Select Counselor</option>
              {counselors.map(counselor => (
                <option key={counselor.id} value={counselor.id}>
                  {counselor.full_name}
                </option>
              ))}
            </motion.select>
          </div>

          {isEditing && (
            <div>
              <label htmlFor="status" className={labelClasses}>Status</label>
              <motion.select
                whileFocus={{ scale: 1.01 }}
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={inputClasses}
                required
                disabled={loading}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="follow-up">Follow-up</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </motion.select>
            </div>
          )}

          <div className={isEditing ? "md:col-span-2" : "md:col-span-2"}>
            <label htmlFor="notes" className={labelClasses}>Notes</label>
            <motion.textarea
              whileFocus={{ scale: 1.01 }}
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className={`${inputClasses} min-h-[100px] resize-y`}
              placeholder="Enter any additional notes or comments..."
              disabled={loading}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium hover:glow-sm transition-all duration-200"
            disabled={loading}
          >
            {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Inquiry' : 'Create Inquiry')}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default InquiryForm; 