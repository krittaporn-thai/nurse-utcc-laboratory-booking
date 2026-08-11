/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navbar, NavTab } from './components/Navbar';
import { AdminLoginModal } from './components/AdminLoginModal';
import { StoriesModal } from './components/StoriesModal';
import { BookingDetailModal } from './components/BookingDetailModal';
import { EditBookingItemsModal } from './components/EditBookingItemsModal';

import { DashboardView } from './views/DashboardView';
import { CalendarView } from './views/CalendarView';
import { LabsView } from './views/LabsView';
import { BookingFormView } from './views/BookingFormView';
import { ApprovalWorkflowView } from './views/ApprovalWorkflowView';
import { PreInspectionView } from './views/PreInspectionView';
import { PostInspectionView } from './views/PostInspectionView';
import { DamageLogView } from './views/DamageLogView';
import { ReportsView } from './views/ReportsView';
import { SupabaseSettingsModal } from './views/SupabaseSettingsModal';

import {
  Laboratory,
  InventoryItem,
  Booking,
  PreInspection,
  PostInspection,
  DamageLog,
  StoryItem
} from './types';
import { loadLocalStore, saveLocalStore, updateDynamicStatuses } from './lib/supabase';

export default function App() {
  const [store, setStore] = useState(() => loadLocalStore());
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [preSelectedLabId, setPreSelectedLabId] = useState<string | undefined>(undefined);

  // Modals
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<StoryItem | null>(null);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<Booking | null>(null);
  const [editingItemsBooking, setEditingItemsBooking] = useState<Booking | null>(null);

  // Recalculate dynamic statuses based on exact current DateTime whenever active tab changes or on mount
  useEffect(() => {
    setStore((prev) => {
      const updatedBookings = updateDynamicStatuses(prev.bookings, prev.postInspections);
      const isChanged = updatedBookings.some((b, i) => b.status !== prev.bookings[i]?.status);
      if (isChanged) {
        return { ...prev, bookings: updatedBookings };
      }
      return prev;
    });
  }, [activeTab]);

  // Sync state to local storage whenever store updates
  useEffect(() => {
    saveLocalStore(store);
  }, [store]);

  // Admin login success handler
  const handleAdminSuccess = () => {
    setStore((prev) => ({ ...prev, isAdminAuthenticated: true }));
  };

  const handleAdminLogout = () => {
    setStore((prev) => ({ ...prev, isAdminAuthenticated: false }));
  };

  // Add new booking handler
  const handleCreateBooking = (newBooking: Booking) => {
    setStore((prev) => ({
      ...prev,
      bookings: [newBooking, ...prev.bookings]
    }));

    setActiveTab('dashboard');
  };

  // Admin Approve booking handler
  const handleApproveBooking = (bookingId: string) => {
    const booking = store.bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const updatedBookings = store.bookings.map((b) => {
      if (b.id === bookingId) {
        return { ...b, status: 'approved' as const };
      }
      return b;
    });

    setStore((prev) => ({
      ...prev,
      bookings: updatedBookings
    }));
  };

  // Admin Reject booking handler
  const handleRejectBooking = (bookingId: string, reason: string) => {
    const booking = store.bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const updatedBookings = store.bookings.map((b) => {
      if (b.id === bookingId) {
        return { ...b, status: 'rejected' as const, rejection_reason: reason };
      }
      return b;
    });

    setStore((prev) => ({
      ...prev,
      bookings: updatedBookings
    }));
  };

  // Update Booking (User or Admin edit)
  const handleUpdateBooking = (updated: Booking) => {
    setStore((prev) => ({
      ...prev,
      bookings: prev.bookings.map((b) => (b.id === updated.id ? updated : b))
    }));
  };

  // Lab CRUD handlers
  const handleAddLab = (lab: Laboratory) => {
    setStore((prev) => ({ ...prev, labs: [...prev.labs, lab] }));
  };

  const handleEditLab = (lab: Laboratory) => {
    setStore((prev) => ({
      ...prev,
      labs: prev.labs.map((l) => (l.id === lab.id ? lab : l))
    }));
  };

  const handleDeleteLab = (labId: string) => {
    setStore((prev) => ({
      ...prev,
      labs: prev.labs.filter((l) => l.id !== labId)
    }));
  };

  // Inspection & Damage handlers
  const handleSavePreInspection = (inspection: PreInspection) => {
    setStore((prev) => ({
      ...prev,
      preInspections: [inspection, ...prev.preInspections],
      bookings: prev.bookings.map((b) =>
        b.id === inspection.booking_id ? { ...b, pre_inspection_done: true } : b
      )
    }));
  };

  const handleSavePostInspection = (inspection: PostInspection) => {
    setStore((prev) => ({
      ...prev,
      postInspections: [inspection, ...prev.postInspections],
      bookings: prev.bookings.map((b) =>
        b.id === inspection.booking_id ? { ...b, status: 'completed' as const, post_inspection_done: true } : b
      )
    }));
  };

  const handleSaveDamage = (damage: DamageLog) => {
    setStore((prev) => ({
      ...prev,
      damages: [damage, ...prev.damages]
    }));
  };

  const handleDeleteDamage = (damageId: string) => {
    setStore((prev) => ({
      ...prev,
      damages: prev.damages.filter((d) => d.id !== damageId)
    }));
  };

  const pendingCount = store.bookings.filter((b) => b.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans bg-grid-pattern selection:bg-teal-600 selection:text-white">
      
      {/* Top Header */}
      <Header
        isAdmin={store.isAdminAuthenticated}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onLogoutAdmin={handleAdminLogout}
        onOpenDbSettings={() => setIsDbModalOpen(true)}
        onSelectStory={(story) => setSelectedStory(story)}
        searchTerm={searchTerm}
        onSearchChange={(val) => setSearchTerm(val)}
        onNewBookingClick={() => {
          setPreSelectedLabId(undefined);
          setActiveTab('booking');
        }}
        labs={store.labs}
      />

      {/* Main Container Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        
        {/* Navigation Panel */}
        <Navbar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          isAdmin={store.isAdminAuthenticated}
          pendingApprovalCount={pendingCount}
        />

        {/* View Content */}
        <main className="flex-1 min-w-0">
          
          {activeTab === 'dashboard' && (
            <DashboardView
              labs={store.labs}
              bookings={store.bookings}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onSelectBookingDetail={(b) => setSelectedBookingDetail(b)}
              searchTerm={searchTerm}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              labs={store.labs}
              bookings={store.bookings}
              onSelectBookingDetail={(b) => setSelectedBookingDetail(b)}
              onNewBookingClick={() => {
                setPreSelectedLabId(undefined);
                setActiveTab('booking');
              }}
            />
          )}

          {activeTab === 'labs' && (
            <LabsView
              labs={store.labs}
              isAdmin={store.isAdminAuthenticated}
              onAddLab={handleAddLab}
              onEditLab={handleEditLab}
              onDeleteLab={handleDeleteLab}
              onReserveLab={(labId) => {
                setPreSelectedLabId(labId);
                setActiveTab('booking');
              }}
              onOpenAdminModal={() => setIsAdminModalOpen(true)}
            />
          )}

          {activeTab === 'booking' && (
            <BookingFormView
              labs={store.labs}
              preSelectedLabId={preSelectedLabId}
              isAdmin={store.isAdminAuthenticated}
              onSubmitBooking={handleCreateBooking}
              onCancel={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'approval' && (
            <ApprovalWorkflowView
              bookings={store.bookings}
              labs={store.labs}
              isAdmin={store.isAdminAuthenticated}
              onApproveBooking={handleApproveBooking}
              onRejectBooking={handleRejectBooking}
              onUpdateBooking={handleUpdateBooking}
              onOpenAdminModal={() => setIsAdminModalOpen(true)}
            />
          )}

          {activeTab === 'pre_check' && (
            <PreInspectionView
              bookings={store.bookings}
              preInspections={store.preInspections}
              isAdmin={store.isAdminAuthenticated}
              onSavePreInspection={handleSavePreInspection}
              onOpenAdminModal={() => setIsAdminModalOpen(true)}
            />
          )}

          {activeTab === 'post_check' && (
            <PostInspectionView
              bookings={store.bookings}
              postInspections={store.postInspections}
              isAdmin={store.isAdminAuthenticated}
              onSavePostInspection={handleSavePostInspection}
              onOpenAdminModal={() => setIsAdminModalOpen(true)}
            />
          )}

          {activeTab === 'damage' && (
            <DamageLogView
              damages={store.damages}
              bookings={store.bookings}
              isAdmin={store.isAdminAuthenticated}
              onSaveDamage={handleSaveDamage}
              onDeleteDamage={handleDeleteDamage}
              onOpenAdminModal={() => setIsAdminModalOpen(true)}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              labs={store.labs}
              bookings={store.bookings}
              isAdmin={store.isAdminAuthenticated}
              onOpenAdminModal={() => setIsAdminModalOpen(true)}
            />
          )}

        </main>
      </div>

      {/* Global Modals */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSuccess={handleAdminSuccess}
      />

      <StoriesModal
        story={selectedStory}
        labs={store.labs}
        onClose={() => setSelectedStory(null)}
        onNavigateLab={(labId) => {
          setPreSelectedLabId(labId);
          setActiveTab('booking');
        }}
      />

      <SupabaseSettingsModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
      />

      <BookingDetailModal
        booking={selectedBookingDetail}
        onClose={() => setSelectedBookingDetail(null)}
        onOpenEditItems={(b) => setEditingItemsBooking(b)}
      />

      {editingItemsBooking && (
        <EditBookingItemsModal
          booking={editingItemsBooking}
          isAdmin={store.isAdminAuthenticated}
          labs={store.labs}
          onClose={() => setEditingItemsBooking(null)}
          onSaveBookingItems={handleUpdateBooking}
        />
      )}

    </div>
  );
}
