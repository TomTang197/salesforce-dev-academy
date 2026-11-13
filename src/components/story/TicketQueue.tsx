import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { StoryTicket } from '../../utils/story';

interface TicketQueueProps {
  tickets: StoryTicket[];
  onOpen: (ticket: StoryTicket) => void;
  limit?: number;
  compact?: boolean;
}

export const TicketQueue: React.FC<TicketQueueProps> = ({ tickets, onOpen, limit, compact = false }) => {
  const [expanded, setExpanded] = useState(false);
  const firstPendingId = tickets.find((t) => !t.completed)?.id;
  const visible = limit && !expanded ? tickets.slice(0, limit) : tickets;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {visible.map((ticket) => {
        const isNext = ticket.id === firstPendingId;
        return (
          <article
            key={ticket.id}
            className={`ticket-card ${compact ? 'compact' : ''} ${isNext ? 'next' : ''} ${ticket.completed ? 'done' : ''}`}
          >
            <span className="avatar-initial" aria-hidden="true">
              {ticket.requester.initial}
            </span>
            <div style={{ minWidth: 0 }}>
              <div className="ticket-meta">
                <span className="ticket-from">{ticket.requester.name}</span>
                <span>{ticket.requester.role}</span>
                {ticket.completed && <span className="status-badge success">已解决</span>}
              </div>
              <div className="ticket-title">{ticket.titleZh}</div>
              <div className="ticket-title-en">{ticket.titleEn}</div>
              {ticket.body && <p className="ticket-text">{ticket.body}</p>}
              <span className="ticket-footer nav-badge">{ticket.footer}</span>
            </div>
            <button
              type="button"
              className={`ticket-action ${isNext ? 'btn-primary' : 'btn-secondary'}`}
              style={{ minHeight: '32px', padding: '4px 12px' }}
              onClick={() => onOpen(ticket)}
            >
              <span>{ticket.completed ? '再看看' : '接下工单'}</span>
              <ArrowRight size={16} strokeWidth={1.5} />
            </button>
          </article>
        );
      })}
      {limit !== undefined && tickets.length > limit && (
        <button
          type="button"
          className="btn-tertiary"
          style={{ alignSelf: 'flex-start' }}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? '收起' : `还有 ${tickets.length - limit} 张工单`}
        </button>
      )}
    </div>
  );
};
