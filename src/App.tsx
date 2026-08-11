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
  deleteBooking,
  createLab,
  updateLab,
  deleteLab,
  createPreInspection,
  updatePreInspection,
  deletePreInspection,
  createPostInspection,
  updatePostInspection,
  deletePostInspection,
  createDamage,
  updateDamage,
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
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<StoryItem | null>(null);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<Booking | null>(null);
  const [editingItemsBooking, setEditingItemsBooking] = useState<Booking | null>(null);
  const [preSelectedLabId, setPreSelectedLabId] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Initial Fetch on Mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const data = await fetchFullStore(store.isAdminAuthenticated);
      if (isMounted && data) {
        setStore((prev) => ({
          ...prev,
          labs: data.labs,
          inventory: data.inventory,
          bookings: updateDynamicStatuses(data.bookings),
          preInspections: data.preInspections,
          postInspections: data.postInspections,
          damages: data.damages
        }));
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Realtime SSE Subscription & Cross-Browser Synchronization
  useEffect(() => {
    const unsubscribe = subscribeToStoreChanges((freshData) => {
      if (freshData) {
        setStore((prev) => ({
          ...freshData,
          bookings: updateDynamicStatuses(freshData.bookings, freshData.postInspections),
          isAdminAuthenticated: prev.isAdminAuthenticated
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  // Admin login / logout
  const handleAdminSuccess = () => {
    setStore((prev) => ({ ...prev, isAdminAuthenticated: true }));
    setIsAdminModalOpen(false);
  };

  const handleAdminLogout = () => {
    setStore((prev) => ({ ...prev, isAdminAuthenticated: false }));
  };

  // Booking CRUD Handlers
  const handleCreateBooking = async (newBooking: Booking) => {
    await createBooking(newBooking);
    const fresh = await fetchFullStore(store.isAdminAuthenticated);
    setStore((prev) => ({ ...fresh, isAdminAuthenticated: prev.isAdminAuthenticated }));
  };

  const handleApproveBooking = async (bookingId: string) => {
    const target = store.bookings.find((b) => b.id === bookingId);
    if (!target) return;
    const updated: Booking = { ...target, status: 'approved' };
    await updateBooking(updated);
    const fresh = await fetchFullStore(store.isAdminAuthenticated);
    setStore((prev) => ({ ...fresh, isAdminAuthenticated: prev.isAdminAuthenticated }));
  };

  const handleRejectBooking = async (bookingId: string, reason: string) => {
    const target = store.bookings.find((b) => b.id === bookingId);
    if (!target) return;
    const updated: Booking = { ...target, status: 'rejected', rejection_reason: reason };
    await updateBooking(updated);
    const fresh = await fetchFullStore(store.isAdminAuthenticated);
    setStore((prev) => ({ ...fresh, isAdminAuthenticated: prev.isAdminAuthenticated }));
  };

  const handleUpdateBooking = async (updated: Booking) => {
    await updateBooking(updated);
    const fresh = await fetchFullStore(store.isAdminAuthenticated);
    setStore((prev) => ({ ...fresh, isAdminAuthenticated: prev.isAdminAuthenticated }));
  };

  const handleDeleteBooking = async (bookingId: string) => {
    await deleteBooking(bookingId);
    const fresh = await fetchFullStore(store.isAdminAuthenticated);
    setStore((prev) => ({ ...fresh, isAdminAuthenticated: prev.isAdminAuthenticated }));
  };

  // Lab CRUD handlers
  const handleAddLab = async (lab: Laboratory) => {
    await createLab(lab);
    const fresh = await fetchFullStore(store.isAdminAuthenticated);
    setStore((prev) => ({ ...fresh, isAdminAuthenticated: prev.isAdminAuthenticated }));
  };

  const handleEditLab = async (lab: Laboratory) => {
    await updateLab(lab);
    const fresh = await fetchFullStore(store.isAdminAuthenticated);
    setStore((prev) => ({ ...fresh, isAdminAuthenticated: prev.isAdminAuthenticated }));
  };

  const handleDeleteLab = async (labId: string) => {
    await deleteLab(labId);
    const fresh = await fetchFullStore(store.isAdminAuthenticated);
    setStore((prev) => ({ ...fresh, isAdminAuthenticated: prev.isAdminAuthenticated }));
  };

  // Pre Inspection Handlers
  const handleSavePreInspection = async (inspection: PreInspection) => {
    await createPreInspection(inspection);
    const fresh = await fetchFullStore(store.isAdminAuthenticated);
    setStore((prev) => ({ ...fresh, isAdminAuthenticated: prev.isAdminAuthenticated }));
  };

  const handleUpdatePreInspection = async (inspection: PreInspection) => {
    await updatePreInspection(inspection);
    const fresh = await fetchFullStore(store.isAdminAuthenticated);
    setStore((prev) => ({ ...fresh, isAdminAuthenticated: prev.isAdminAuthenticated }));
  };

  const handleDeletePreInspection = async (inspectionId: string) => {
    await deletePreInspection(inspectionId);
    const fresh = await fetchFullStore(store.isAdminAuthenticated);
    setStore((prev) => ({ ...fresh, isAdminAuthenticated: prev.isAdminAuthenticated }));
  };

  // Post Inspection Handlers
  const handleSavePostInspection = async (inspection: PostInspection) => {
    await createPostInspection(inspection);
    const fresh = await fetchFullStore(store.isAdminAuthenticated);
    setStore((prev) => ({ ...fresh, isAdminAuthenticated: prev.isAdminAuthenticated }));
  };

  const handleUpdatePostInspection = async (inspection: PostInspection) => {
    await updatePostInspection(inspection);
    const fresh = await fetchFullStore(store.isAdminAuthenticated);
    setStore((prev) => ({ ...fresh, isAdminAuthenticated: prev.isAdminAuthenticated }));
  };

  const handleDeletePostInspection = async (inspectionId: string) => {
    await deletePostInspection(inspectionId);
    const fresh = await fetchFullStore(store.isAdminAuthenticated);
    setStore((prev) => ({ ...fresh, isAdminAuthenticated: prev.isAdminAuthenticated }));
  };

  // Damage Handlers
  const handleSaveDamage = async (damage: DamageLog) => {
    await createDamage(damage);
    const fresh = await fetchFullStore(store.isAdminAuthenticated);
    setStore((prev) => ({ ...fresh, isAdminAuthenticated: prev.isAdminAuthenticated }));
  };

  const handleUpdateDamage = async (damage: DamageLog) => {
    await updateDamage(damage);
    const fresh = await fetchFullStore(store.isAdminAuthenticated);
    setStore((prev) => ({ ...fresh, isAdminAuthenticated: prev.isAdminAuthenticated }));
  };

  const handleDeleteDamage = async (damageId: string) => {
    await deleteDamage(damageId);
    const fresh = await fetchFullStore(store.isAdminAuthenticated);
    setStore((prev) => ({ ...fresh, isAdminAuthenticated: prev.isAdminAuthenticated }));
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
              onDeleteBooking={handleDeleteBooking}
              onOpenAdminModal={() => setIsAdminModalOpen(true)}
            />
          )}

          {activeTab === 'pre_check' && (
            <PreInspectionView
              bookings={store.bookings}
              preInspections={store.preInspections}
              isAdmin={store.isAdminAuthenticated}
              onSavePreInspection={handleSavePreInspection}
              onUpdatePreInspection={handleUpdatePreInspection}
              onDeletePreInspection={handleDeletePreInspection}
              onOpenAdminModal={() => setIsAdminModalOpen(true)}
            />
          )}

          {activeTab === 'post_check' && (
            <PostInspectionView
              bookings={store.bookings}
              postInspections={store.postInspections}
              isAdmin={store.isAdminAuthenticated}
              onSavePostInspection={handleSavePostInspection}
              onUpdatePostInspection={handleUpdatePostInspection}
              onDeletePostInspection={handleDeletePostInspection}
              onOpenAdminModal={() => setIsAdminModalOpen(true)}
            />
          )}

          {activeTab === 'damage' && (
            <DamageLogView
              damages={store.damages}
              bookings={store.bookings}
              isAdmin={store.isAdminAuthenticated}
              onSaveDamage={handleSaveDamage}
              onUpdateDamage={handleUpdateDamage}
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
