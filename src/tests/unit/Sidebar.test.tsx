import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';

describe('Sidebar', () => {
  it('renders the Legales menu item with correct link', () => {
    render(
      <MemoryRouter>
        <Sidebar sidebarOpen={false} setSidebarOpen={() => {}} />
      </MemoryRouter>
    );

    const link = screen.getByText('Legales');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/legals');

    const giftsLink = screen.getByText('Gifts');
    expect(giftsLink).toBeInTheDocument();
    expect(giftsLink.closest('a')).toHaveAttribute('href', '/gifts');
  });
});
