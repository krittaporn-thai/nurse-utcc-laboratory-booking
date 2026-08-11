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
  Booking,
  PreInspection,
  PostInspection,
  DamageLog,
  StoryItem
} from './types';
import {
  fetchFullStore,
  subscribeToStoreChanges,
  createBooking,
  updateBooking,
  createLab,
  updateLab,
  deleteLab,
  createPreInspection,
  createPostInspection,
  createDamage,
  deleteDamage,
  updateDynamicStatuses
} from './lib/supabase';
import { INITIAL_LABS, INITIAL_INVENTORY, INITIAL_BOOKINGS, INITIAL_PRE_INSPECTIONS, INITIAL_POST_INSPECTIONS, INITIAL_DAMAGES } from './lib/initialData';

export default function App() {
  const [store, setStore] = useState({
    labs: INITIAL_LABS,
    inventory: INITIAL_INVENTORY,
    bookings: INITIAL_BOOKINGS,
    preInspections: INITIAL_PRE_INSPECTIONS,
    postInspections: INITIAL_POST_INSPECTIONS,
    damages: INITIAL_DAMAGES,
    isAdminAuthenticated: false
  });

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [preSelectedLabId, setPreSelectedLabId] = useState<string | undefined>(undefined);

  // Modals
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<StoryItem | null>(null);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<Booking | null>(null);
  const [editingItemsBooking, setEditingItemsBooking] = useState<Booking | null>(null);

  // Load central store from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    fetchFullStore(store.isAdminAuthenticated).then((data) => {
      if (isMounted && data) {
        setStore((prev) => ({
          ...data,
          isAdminAuthenticated: prev.isAdminAuthenticated
        }));
      }
    });

    // Real-time listener for multi-browser sync via Supabase Realtime
    const unsubscribe = subscribeToStoreChanges((freshStore) => {
      if (isMounted) {
        setStore((prev) => ({
          ...freshStore,
          isAdminAuthenticated: prev.isAdminAuthenticated
        }));
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

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

  // Admin login success handler
  const handleAdminSuccess = () => {
    setStore((prev) => ({ ...prev, isAdminAuthenticated: true }));
  };

  const handleAdminLogout = () => {
    setStore((prev) => ({ ...prev, isAdminAuthenticated: false }));
  };

  // Add new booking handler
  const handleCreateBooking = async (newBooking: Booking) => {
    const saved = await createBooking(newBooking);
    setStore((prev) => ({
      ...prev,
      bookings: [saved, ...prev.bookings]
    }));
    setActiveTab('dashboard');
  };

  // Admin Approve booking handler
  const handleApproveBooking = async (bookingId: string) => {
    const booking = store.bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const updated: Booking = { ...booking, status: 'approved' as const };
    await updateBooking(updated);

    setStore((prev) => ({
      ...prev,
      bookings: prev.bookings.map((b) => (b.id === bookingId ? updated : b))
    }));
  };

  // Admin Reject booking handler
  const handleRejectBooking = async (bookingId: string, reason: string) => {
    const booking = store.bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const updated: Booking = { ...booking, status: 'rejected' as const, rejection_reason: reason };
    await updateBooking(updated);

    setStore((prev) => ({
      ...prev,
      bookings: prev.bookings.map((b) => (b.id === bookingId ? updated : b))
    }));
  };

  // Update Booking (User or Admin edit)
  const handleUpdateBooking = async (updated: Booking) => {
    await updateBooking(updated);
    setStore((prev) => ({
      ...prev,
      bookings: prev.bookings.map((b) => (b.id === updated.id ? updated : b))
    }));
  };

  // Lab CRUD handlers
  const handleAddLab = async (lab: Laboratory) => {
    const saved = await createLab(lab);
    setStore((prev) => ({ ...prev, labs: [saved, ...prev.labs] }));
  };

  const handleEditLab = async (lab: Laboratory) => {
    await updateLab(lab);
    setStore((prev) => ({
      ...prev,
      labs: prev.labs.map((l) => (l.id === lab.id ? lab : l))
    }));
  };

  const handleDeleteLab = async (labId: string) => {
    await deleteLab(labId);
    setStore((prev) => ({
      ...prev,
      labs: prev.labs.filter((l) => l.id !== labId)
    }));
  };

  // Inspection & Damage handlers
  const handleSavePreInspection = async (inspection: PreInspection) => {
    const saved = await createPreInspection(inspection);
    setStore((prev) => ({
      ...prev,
      preInspections: [saved, ...prev.preInspections],
      bookings: prev.bookings.map((b) =>
        b.id === inspection.booking_id ? { ...b, pre_inspection_done: true } : b
      )
    }));
  };

  const handleSavePostInspection = async (inspection: PostInspection) => {
    const saved = await createPostInspection(inspection);
    setStore((prev) => ({
      ...prev,
      postInspections: [saved, ...prev.postInspections],
      bookings: prev.bookings.map((b) =>
        b.id === inspection.booking_id ? { ...b, status: 'completed' as const, post_inspection_done: true } : b
      )
    }));
  };

  const handleSaveDamage = async (damage: DamageLog) => {
    const saved = await createDamage(damage);
    setStore((prev) => ({
      ...prev,
      damages: [saved, ...prev.damages]
    }));
  };

  const handleDeleteDamage = async (damageId: string) => {
    await deleteDamage(damageId);
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

