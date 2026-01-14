import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import NoteList from '../components/notes/NoteList';
import NoteForm from '../components/notes/NoteForm';
import { Plus, LogOut, Building2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import notesService from '../services/notes';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const { data: notes, isLoading, error, refetch } = useQuery({
    queryKey: ['notes'],
    queryFn: () => notesService.getAll().then(res => res.data),
    retry: 1,
    refetchOnWindowFocus: false
  });

  const handleEditNote = (note) => {
    setEditingNote(note);
    setShowNoteForm(true);
  };

  const handleNoteFormClose = () => {
    setShowNoteForm(false);
    setEditingNote(null);
  };

  const handleNoteFormSuccess = () => {
    refetch();
    handleNoteFormClose();
    toast.success(editingNote ? 'Note updated!' : 'Note created!');
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Header */}
      <header className="bg-white shadow w-full">
        <div className="px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-indigo-600" />
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-gray-900">Notes App</h1>
                <p className="text-sm text-gray-500">
                  {user?.company_name ? user.company_name : 'Tenant Dashboard'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-6 px-4 sm:px-6 lg:px-8 w-full">
        {/* Welcome Section */}
        <div className="py-6">
          <div className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome back, {user?.name}!
            </h2>
            <p className="text-indigo-100">
              {isLoading
                ? "Loading your notes..."
                : notes?.length === 0
                ? "You haven't created any notes yet. Start by creating your first note!"
                : `You have ${notes?.length} note${notes?.length !== 1 ? 's' : ''} in your workspace.`}
            </p>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">Your Notes</h2>
            <button
              onClick={() => setShowNoteForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </button>
          </div>

          {error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Error loading notes: {error.message}</p>
              <button
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <NoteList
              notes={notes || []}
              isLoading={isLoading}
              onEdit={handleEditNote}
              onDeleteSuccess={() => {
                refetch();
                toast.success('Note deleted!');
              }}
            />
          )}
        </div>
      </main>

      {/* Note Form Modal */}
      {showNoteForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <NoteForm
              note={editingNote}
              onClose={handleNoteFormClose}
              onSuccess={handleNoteFormSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
