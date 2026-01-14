import React from 'react';
import { format } from 'date-fns';
import { Edit2, Trash2, FileText } from 'lucide-react';
import notesService from '../../services/notes';
import toast from 'react-hot-toast';

const NoteSkeleton = () => (
  <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 animate-pulse">
    <div className="p-5">
      <div className="flex justify-between items-start mb-4">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="flex space-x-2">
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  </div>
);

const NoteList = ({ notes, isLoading = false, onEdit, onDeleteSuccess }) => {
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await notesService.delete(id);
        onDeleteSuccess();
      } catch (error) {
        toast.error('Failed to delete note');
      }
    }
  };

  if (isLoading && notes.length === 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <NoteSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No notes</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new note.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <div
          key={note.id}
          className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
        >
          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {note.title}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(note)}
                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                  title="Edit note"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete note"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4 line-clamp-3">
              {note.content}
            </p>
            
            <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t border-gray-100">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                note.category === 'work' ? 'bg-blue-100 text-blue-800' :
                note.category === 'personal' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {note.category}
              </span>
              <span>
                {format(new Date(note.updated_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NoteList;
