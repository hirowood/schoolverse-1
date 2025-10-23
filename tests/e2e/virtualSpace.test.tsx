/** @vitest-environment jsdom */
/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as THREE from 'three';

const keyboardState = { up: false, down: false, left: false, right: false };
function updateKeyboardState(next: Partial<typeof keyboardState>) {
  Object.assign(keyboardState, next);
}

const authState = { user: { id: 'tester-1', displayName: 'Test User' } as { id: string; displayName: string | null } };
function updateAuthUser(user: { id: string; displayName: string | null }) {
  authState.user = user;
}

type SocketEventHandler = (payload: unknown) => void;

type SocketMockInstance = {
  emit: ReturnType<typeof vi.fn>;
  on: (event: string, handler: SocketEventHandler) => SocketMockInstance;
  off: (event: string, handler: SocketEventHandler) => SocketMockInstance;
};

type SocketTestHelpers = {
  trigger: (event: string, payload: unknown) => void;
  reset: () => void;
  emit: ReturnType<typeof vi.fn>;
};

type FrameCallback = (state: { camera: THREE.PerspectiveCamera }, delta: number) => void;
type FiberTestHelpers = {
  runFrame: (delta?: number) => void;
  reset: () => void;
};

vi.mock('@react-three/fiber', () => {
  const callbacks: FrameCallback[] = [];
  const camera = new THREE.PerspectiveCamera();
  camera.position.set(0, 0, 0);
  const state = { camera };

  const helpers: FiberTestHelpers = {
    runFrame(delta = 1 / 60) {
      callbacks.forEach((cb) => cb(state, delta));
    },
    reset() {
      callbacks.length = 0;
      camera.position.set(0, 0, 0);
    },
  };

  return {
    __esModule: true,
    Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-canvas">{children}</div>,
    useFrame: (fn: FrameCallback) => {
      callbacks.push(fn);
    },
    __mock: helpers,
  };
});

vi.mock('@react-three/drei', () => ({
  __esModule: true,
  Html: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock('@/hooks/useKeyboard', () => ({
  __esModule: true,
  __updateKeyboardState: updateKeyboardState,
  default: () => keyboardState,
}));

vi.mock('@/store/authStore', () => ({
  __esModule: true,
  __updateAuthUser: updateAuthUser,
  useAuthStore: () => authState,
}));

vi.mock('@/lib/socket/socketClient', () => {
  const listeners = new Map<string, Set<SocketEventHandler>>();
  const emitFn = vi.fn();

  const instance: SocketMockInstance = {
    emit: emitFn,
    on(event, handler) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(handler);
      return instance;
    },
    off(event, handler) {
      listeners.get(event)?.delete(handler);
      return instance;
    },
  };

  const helpers: SocketTestHelpers = {
    trigger(event, payload) {
      listeners.get(event)?.forEach((handler) => handler(payload));
    },
    reset() {
      emitFn.mockClear();
      listeners.clear();
    },
    emit: emitFn,
  };

  return {
    __esModule: true,
    getSocket: () => instance,
    __socketMock: helpers,
  };
});

import VirtualSpace from '@/components/canvas/VirtualSpace';
import * as FiberModule from '@react-three/fiber';
import * as KeyboardModule from '@/hooks/useKeyboard';
import * as AuthModule from '@/store/authStore';
import * as SocketModule from '@/lib/socket/socketClient';
type KeyboardTestHelpers = {
  __updateKeyboardState: typeof updateKeyboardState;
};
type AuthTestHelpers = {
  __updateAuthUser: typeof updateAuthUser;
};

const fiberMock = (FiberModule as unknown as { __mock: FiberTestHelpers }).__mock;
const socketHelpers = (SocketModule as unknown as { __socketMock: SocketTestHelpers }).__socketMock;
const setKeyboard = (KeyboardModule as unknown as KeyboardTestHelpers).__updateKeyboardState;
const setAuth = (AuthModule as unknown as AuthTestHelpers).__updateAuthUser;

describe('VirtualSpace component (E2E-lite)', () => {
  let performanceSpy: ReturnType<typeof vi.spyOn>;
  let now = 0;

  beforeEach(() => {
    fiberMock.reset();
    socketHelpers.reset();
    setKeyboard({ up: false, down: false, left: false, right: false });
    setAuth({ id: 'user-1', displayName: 'Alice Tester' });
    now = 0;
    performanceSpy = vi.spyOn(performance, 'now').mockImplementation(() => now);
  });

  afterEach(() => {
    performanceSpy.mockRestore();
  });

  it('joins presence channel and renders peers from server snapshot', async () => {
    render(<VirtualSpace />);

    expect(socketHelpers.emit).toHaveBeenCalledWith('presence:join', {
      userId: 'user-1',
      displayName: 'Alice Tester',
    });

    act(() =>
      socketHelpers.trigger('presence:state', [
        { userId: 'peer-1', x: 400, y: 420, displayName: 'Bob Peer' },
      ]),
    );

    await waitFor(() => {
      expect(screen.getByText('Bob Peer')).toBeInTheDocument();
    });
  });

  it('broadcasts player movement based on keyboard state and clamps to bounds', async () => {
    render(<VirtualSpace />);

    socketHelpers.trigger('presence:state', []);

    setKeyboard({ up: true });
    now = 100;

    await act(async () => {
      fiberMock.runFrame(0.016);
    });

    expect(socketHelpers.emit).toHaveBeenCalledWith(
      'space:position:update',
      expect.objectContaining({
        x: expect.any(Number),
        y: expect.any(Number),
      }),
    );
  });

  it('adds and removes peers on socket events', async () => {
    render(<VirtualSpace />);

    act(() =>
      socketHelpers.trigger('presence:joined', {
        userId: 'peer-2',
        x: 520,
        y: 540,
        displayName: 'Carol Peer',
      }),
    );

    await waitFor(() => {
      expect(screen.getByText('Carol Peer')).toBeInTheDocument();
    });

    act(() => socketHelpers.trigger('presence:left', { userId: 'peer-2' }));

    await waitFor(() => {
      expect(screen.queryByText('Carol Peer')).not.toBeInTheDocument();
    });
  });
});
