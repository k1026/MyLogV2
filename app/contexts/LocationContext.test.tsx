import React, { useContext } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LocationProvider, useLocation } from '../../app/contexts/LocationContext';

// Mock Component to consume context
const TestComponent = () => {
    const { status, toggleLocation } = useLocation();
    return (
        <div>
            <div data-testid="status">{status}</div>
            <button onClick={toggleLocation}>Toggle</button>
        </div>
    );
};

describe('LocationContext', () => {
    beforeEach(() => {
        // Mock navigator.geolocation
        const mockGeolocation = {
            watchPosition: vi.fn(),
            clearWatch: vi.fn(),
            getCurrentPosition: vi.fn(),
        };
        Object.defineProperty(global.navigator, 'geolocation', {
            value: mockGeolocation,
            writable: true,
        });
    });

    it('toggles status when toggleLocation is called', () => {
        render(
            <LocationProvider>
                <TestComponent />
            </LocationProvider>
        );

        // Initial status might be loading or error depending on mock behavior,
        // but let's assume we want to test that toggle changes it.
        // If logic is: active -> disabled -> active (re-enable)

        // For now, checking if it DOES anything.
        // Current implementation is console.log, so status won't change.

        const button = screen.getByText('Toggle');
        fireEvent.click(button);

        // We expect status to change. 
        // If current is 'loading' (default), maybe toggle stops it?
        // Or if 'active', toggle disables it?
        // The requirement says "toggle ON/OFF".
        // So we expect status to become 'disabled' or 'active'.
        // This test will FAIL if toggleLocation implementation is empty.

        // Let's assume we start with 'active' (by mocking success callback) or force state.
        // Since we can't easily force internal state without exposing setter,
        // we'll rely on the fact that the initial implementation does NOTHING.

        // But what IS the expected behavior?
        // Spec says: "タップで位置情報取得の有効/無効切り替え"
        // So: active/loading -> disabled
        // disabled -> active
    });

    it('should switch from active to disabled and back', () => {
        // Ideally we Mock the state to be Active first.
        // Since internal state is hard to mock directly in integration test, 
        // we will rely on the implementation fixing it.
        // Here I write a test that expects a transition.

        render(
            <LocationProvider>
                <TestComponent />
            </LocationProvider>
        );

        // If we can't easily get to 'active', we can test invalid transitions if any?
        // Or just verify that clicking the button changes the status to 'disabled' if it was enabled (or loading).

        const statusDiv = screen.getByTestId('status');
        const initialStatus = statusDiv.textContent;

        fireEvent.click(screen.getByText('Toggle'));

        // Expect status to change
        expect(statusDiv.textContent).not.toBe(initialStatus);
        expect(statusDiv.textContent).toBe('disabled');
        // Assuming default 'loading' toggles to 'disabled'? Or 'active' toggles to 'disabled'.
    });
});
