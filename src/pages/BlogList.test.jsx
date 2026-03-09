import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BlogList from './BlogList';
import { POSTS } from '../data/posts';

function renderBlogList() {
    return render(
        <MemoryRouter>
            <BlogList />
        </MemoryRouter>
    );
}

describe('BlogList', () => {
    it('renders the page heading', () => {
        renderBlogList();
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Tidy Blog');
    });

    it('renders the subtitle', () => {
        renderBlogList();
        expect(screen.getByText(/Cleaning tips, hack reviews/i)).toBeInTheDocument();
    });

    it('renders a card for every post in POSTS', () => {
        renderBlogList();
        const headings = screen.getAllByRole('heading', { level: 2 });
        expect(headings.length).toBe(POSTS.length);
    });

    it('renders each post title as a heading', () => {
        renderBlogList();
        for (const post of POSTS) {
            expect(screen.getByText(post.title)).toBeInTheDocument();
        }
    });

    it('renders each post excerpt', () => {
        renderBlogList();
        for (const post of POSTS) {
            expect(screen.getByText(post.excerpt)).toBeInTheDocument();
        }
    });

    it('renders each post category chip', () => {
        renderBlogList();
        for (const post of POSTS) {
            // getAllByText because the same category can appear multiple times
            const chips = screen.getAllByText(post.category);
            expect(chips.length).toBeGreaterThan(0);
        }
    });

    it('renders a link to the correct blog post URL for each post', () => {
        renderBlogList();
        for (const post of POSTS) {
            const links = screen.getAllByRole('link');
            const match = links.find(l => l.getAttribute('href') === `/blog/${post.slug}`);
            expect(match).toBeDefined();
        }
    });

    it('renders a "Read more" label for each card', () => {
        renderBlogList();
        const readMoreLinks = screen.getAllByText('Read more →');
        expect(readMoreLinks.length).toBe(POSTS.length);
    });

    it('renders the date for each post', () => {
        renderBlogList();
        for (const post of POSTS) {
            const dates = screen.getAllByText(post.date);
            expect(dates.length).toBeGreaterThan(0);
        }
    });
});
