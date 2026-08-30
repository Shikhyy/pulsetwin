import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NavigationRail from '../features/navigation/NavigationRail';
import FactoryViewport from '../features/factory/FactoryViewport';
import { ContextPanel } from '../features/operations/ContextPanel';
import NotificationBadge from '../features/notifications/NotificationBadge';
import DemoBar from '../features/demo/DemoBar';
import HUDBar from '../features/navigation/HUDBar';
import useWebSocket from '../hooks/useWebSocket';
import { useTwinStore } from '../stores/twinStore';
import { useUiStore } from '../stores/uiStore';

export default function AppShell() {
  // Establish WebSocket connection for the lifetime of the app session
  useWebSocket();

  const selectedStationId = useTwinStore(s => s.selectedStationId);
  const selectedUnitId = useTwinStore(s => s.selectedUnitId);
  const mode = useUiStore(s => s.mode);

  const isPanelOpen =
    selectedStationId !== null ||
    selectedUnitId !== null ||
    mode === 'simulation' ||
    mode === 'planning' ||
    mode === 'leadership';

  return (
    <div
      className="flex w-screen h-screen overflow-hidden"
      style={{ background: '#0D0F12' }}
    >
      {/* Left navigation rail */}
      <NavigationRail />

      {/* Main content area */}
      <main className="flex-1 relative h-full flex flex-col overflow-hidden">
        {/* Top HUD bar */}
        <HUDBar />

        {/* Factory viewport fills remaining space */}
        <div className="flex-1 relative overflow-hidden">
          {/* Notification badge (top-right of viewport) */}
          <NotificationBadge />

          {/* The 3D factory — always visible */}
          <FactoryViewport />
        </div>

        {/* Demo control bar at bottom */}
        <DemoBar isPanelOpen={isPanelOpen} />
      </main>

      {/* Right context panel — slides in when station/unit selected or mode changes */}
      <ContextPanel />
    </div>
  );
}
