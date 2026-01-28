import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { LocationProvider, useLocation } from './LocationContext';

const TestComponent = () => {
    const { status, toggleLocation } = useLocation();
    return (
        <div>
            <span data-testid="status">{status}</span>
            <button data-testid="toggle" onClick={toggleLocation}>Toggle</button>
        </div>
    );
};

describe('LocationContext', () => {
    it('should toggle status correctly', () => {
        render(
            <LocationProvider>
                <TestComponent />
            </LocationProvider>
        );

        const statusElement = screen.getByTestId('status');
        const toggleButton = screen.getByTestId('toggle');

        expect(statusElement).toHaveTextContent('idle');

        // First click: idle -> loading -> active (simulated)
        // Since we are doing TDD, we expect this logic to be implemented later.
        // For now, we just expect the status to change from 'idle'.
        fireEvent.click(toggleButton);

        // This assertion should fail with the empty implementation
        expect(statusElement).not.toHaveTextContent('idle');
    });
});
