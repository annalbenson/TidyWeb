import { useParams, Link } from 'react-router-dom';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { getPost } from '../data/posts';

function categoryClass(category) {
    if (category === 'Tip Roundup') return 'roundup';
    if (category === 'Hack Review') return 'review';
    if (category === 'Seasonal')    return 'seasonal';
    return 'roundup';
}

export default function BlogPost() {
    const { slug } = useParams();
    const post = getPost(slug);

    return (
        <>
            <Nav />
            <main className="blog-post-page">
                <Link to="/blog" className="blog-back-link">← All posts</Link>
                {post ? (
                    <article>
                        <span className={`blog-category-chip ${categoryClass(post.category)}`}>{post.category}</span>
                        <h1 className="blog-post-title">{post.title}</h1>
                        <p className="blog-post-meta">{post.date}</p>
                        <div className="blog-post-body">
                            {post.sections.map((section, i) => (
                                <div key={i}>
                                    {section.heading && <h2>{section.heading}</h2>}
                                    <p>{section.body}</p>
                                </div>
                            ))}
                        </div>
                    </article>
                ) : (
                    <div className="blog-not-found">
                        <p>Post not found.</p>
                        <Link to="/blog" className="blog-back-link">← Back to blog</Link>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}
