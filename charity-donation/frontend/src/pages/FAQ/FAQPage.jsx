import { useState, useMemo } from 'react';
import { MOCK_FAQS } from '../../utils/mockData';
import SearchBar from '../../components/common/SearchBar';
import EmptyState from '../../components/common/EmptyState';
import './FAQPage.css';

const CATS = ['All', ...new Set(MOCK_FAQS.map(f => f.category))];

const AccordionItem = ({ faq }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`accordion ${open ? 'accordion--open' : ''}`}>
      <button className="accordion__q" onClick={() => setOpen(o => !o)}>
        {faq.question}
        <span className="accordion__icon">{open ? '−' : '+'}</span>
      </button>
      <div className="accordion__answer">
        <p>{faq.answer}</p>
      </div>
    </div>
  );
};

const FAQPage = () => {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');

  const filtered = useMemo(() => {
    let f = MOCK_FAQS;
    if (cat !== 'All') f = f.filter(q => q.category === cat);
    if (search.trim()) {
      const q = search.toLowerCase();
      f = f.filter(item => item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q));
    }
    return f;
  }, [search, cat]);

  return (
    <div className="faq-page">
      <div className="faq-hero">
        <div className="container">
          <h1 className="faq-hero__title">Frequently Asked Questions</h1>
          <p className="faq-hero__sub">Find answers to common questions about HopeFund.</p>
          <SearchBar value={search} onChange={setSearch} placeholder="Search questions..." className="faq-hero__search" />
        </div>
      </div>
      <div className="container faq-body">
        <div className="faq-cats">
          {CATS.map(c => (
            <button key={c} className={`filter-pill ${cat === c ? 'filter-pill--active' : ''}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        {filtered.length === 0
          ? <EmptyState title="No questions found" description="Try a different search term." />
          : <div className="faq-list">{filtered.map(f => <AccordionItem key={f.id} faq={f} />)}</div>
        }
      </div>
    </div>
  );
};
export default FAQPage;