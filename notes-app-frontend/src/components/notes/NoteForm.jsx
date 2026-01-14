import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { X } from 'lucide-react';
import notesService from '../../services/notes';
import toast from 'react-hot-toast';

const NoteForm = ({ note, onClose, onSuccess }) => {
  const isEditing = !!note;

  const formik = useFormik({
    initialValues: {
      title: note?.title || '',
      content: note?.content || '',
      category: note?.category || 'personal'
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .required('Title is required')
        .max(100, 'Title must be less than 100 characters'),
      content: Yup.string()
        .required('Content is required')
        .max(2000, 'Content must be less than 2000 characters'),
      category: Yup.string()
        .oneOf(['work', 'personal', 'other'], 'Invalid category')
        .required('Category is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (isEditing) {
          await notesService.update(note.id, values);
        } else {
          await notesService.create(values);
        }
        onSuccess();
      } catch (error) {
        toast.error(`Failed to ${isEditing ? 'update' : 'create'} note`);
      } finally {
        setSubmitting(false);
      }
    }
  });

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEditing ? 'Edit Note' : 'New Note'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm ${
              formik.touched.title && formik.errors.title
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-indigo-500'
            }`}
            {...formik.getFieldProps('title')}
          />
          {formik.touched.title && formik.errors.title && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.title}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm ${
              formik.touched.category && formik.errors.category
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-indigo-500'
            }`}
            {...formik.getFieldProps('category')}
          >
            <option value="personal">Personal</option>
            <option value="work">Work</option>
            <option value="other">Other</option>
          </select>
          {formik.touched.category && formik.errors.category && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.category}</p>
          )}
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            rows="6"
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm ${
              formik.touched.content && formik.errors.content
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-indigo-500'
            }`}
            {...formik.getFieldProps('content')}
          />
          {formik.touched.content && formik.errors.content && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.content}</p>
          )}
          <div className="mt-1 text-right text-sm text-gray-500">
            {formik.values.content.length}/2000
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {formik.isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditing ? 'Updating...' : 'Creating...'}
              </span>
            ) : (
              isEditing ? 'Update Note' : 'Create Note'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoteForm;
