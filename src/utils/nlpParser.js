// Smart Task NLP Command Line Parser

export function parseNaturalLanguageTask(inputString, teamMembers = []) {
  if (!inputString || !inputString.trim()) {
    return { title: '', priority: 'Medium', tags: [], assignee: null, dueDate: '' };
  }

  let text = inputString.trim();
  let priority = 'Medium';
  const tags = [];
  let assignee = null;
  let dueDate = '';

  // 1. Extract Priority (!urgent, !high, !medium, !low)
  const priorityMatch = text.match(/!(urgent|high|medium|low)/i);
  if (priorityMatch) {
    const rawP = priorityMatch[1].toLowerCase();
    if (rawP === 'urgent') priority = 'Urgent';
    else if (rawP === 'high') priority = 'High';
    else if (rawP === 'medium') priority = 'Medium';
    else if (rawP === 'low') priority = 'Low';
    text = text.replace(priorityMatch[0], '');
  }

  // 2. Extract Tags (#tagname)
  const tagMatches = text.match(/#([\w-]+)/g);
  if (tagMatches) {
    tagMatches.forEach(tagToken => {
      const tag = tagToken.replace('#', '');
      tags.push(tag.charAt(0).toUpperCase() + tag.slice(1));
      text = text.replace(tagToken, '');
    });
  }

  // 3. Extract Assignee (@name or @initials)
  const assigneeMatch = text.match(/@([\w]+)/i);
  if (assigneeMatch) {
    const handle = assigneeMatch[1].toLowerCase();
    const matchedMember = teamMembers.find(m => 
      m.name.toLowerCase().includes(handle) || 
      m.avatar.toLowerCase() === handle
    );
    if (matchedMember) {
      assignee = matchedMember;
    } else {
      assignee = { name: assigneeMatch[1], avatar: assigneeMatch[1].substring(0, 2).toUpperCase(), color: '#8B5CF6' };
    }
    text = text.replace(assigneeMatch[0], '');
  }

  // 4. Extract Quick Date Keywords (today, tomorrow, next week, in X days)
  const today = new Date();
  if (/\b(today)\b/i.test(text)) {
    dueDate = today.toISOString().split('T')[0];
    text = text.replace(/\b(today)\b/i, '');
  } else if (/\b(tomorrow)\b/i.test(text)) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    dueDate = tomorrow.toISOString().split('T')[0];
    text = text.replace(/\b(tomorrow)\b/i, '');
  } else if (/\b(next week)\b/i.test(text)) {
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    dueDate = nextWeek.toISOString().split('T')[0];
    text = text.replace(/\b(next week)\b/i, '');
  }

  // Clean remaining text as task title
  const cleanTitle = text.replace(/\s+/g, ' ').trim();

  return {
    title: cleanTitle || inputString,
    priority,
    tags,
    assignee,
    dueDate: dueDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  };
}
