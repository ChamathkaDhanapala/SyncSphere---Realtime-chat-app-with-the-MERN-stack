import { useState } from "react";

const reactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

const MessageReactions = ({ message, onReact, currentUserId, isOpen, onToggle, position = 'left' }) => {
  const userReaction = message.reactions?.find(r => r.user === currentUserId || r.user?._id === currentUserId);

  // Reaction picker (floating menu)
  if (isOpen) {
    return (
      <div style={{
        position: 'absolute',
        [position === 'left' ? 'left' : 'right']: '0',
        bottom: '100%',
        backgroundColor: '#1f2937',
        border: '1px solid #374151',
        borderRadius: '24px',
        padding: '4px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        zIndex: 1000,
        display: 'flex',
        gap: '2px'
      }}>
        {reactions.map(reaction => (
          <button
            key={reaction}
            onClick={() => {
              onReact(message._id, reaction);
              onToggle();
            }}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              fontSize: '18px',
              padding: '4px',
              borderRadius: '50%',
              transition: 'transform 0.2s',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.2)';
              e.target.style.backgroundColor = '#374151';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            {reaction}
          </button>
        ))}
      </div>
    );
  }

  // Display existing reactions (appears below message)
  const reactionCounts = message.reactions?.reduce((acc, reaction) => {
    acc[reaction.reaction] = (acc[reaction.reaction] || 0) + 1;
    return acc;
  }, {}) || {};

  if (Object.keys(reactionCounts).length === 0) {
    return null;
  }

  return (
    <div style={{ 
      display: 'flex', 
      gap: '4px', 
      flexWrap: 'wrap',
      marginTop: '2px',
      justifyContent: 'flex-end'
    }}>
      {Object.entries(reactionCounts)
        .slice(0, 3) // Show max 3 reactions
        .map(([reaction, count]) => (
          <div
            key={reaction}
            style={{
              backgroundColor: '#1f2937',
              padding: '1px 6px',
              borderRadius: '12px',
              fontSize: '12px',
              border: userReaction?.reaction === reaction ? '1px solid #3b82f6' : '1px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            <span>{reaction}</span>
            {count > 1 && <span style={{ fontSize: '10px' }}>{count}</span>}
          </div>
        ))}
    </div>
  );
};

export default MessageReactions;