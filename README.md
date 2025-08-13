# Qualitative Coding App

A single-page, browser-only qualitative coding application for students to analyze text documents by highlighting passages, assigning tags, adding memos, and exporting data as CSV.

## Features

- 📝 **Document Input**: Paste text or upload .txt files
- 🖱️ **Text Selection**: Highlight passages within paragraphs
- 🏷️ **Tagging System**: Assign and manage tags with search functionality
- 📋 **Memo Support**: Add 1-3 sentence notes to coded segments
- 📊 **CSV Export**: Export coded data for analysis
- 💾 **Auto-Save**: Browser storage with unsaved changes protection
- 🔍 **Filtering**: Filter segments by tags
- ⌨️ **Keyboard Shortcuts**: Efficient workflow with hotkeys
- 📱 **Responsive**: Works on desktop, tablet, and mobile

## Usage

1. **Load a Document**: Paste text or upload a .txt file
2. **Select Text**: Click and drag to highlight text within paragraphs
3. **Add Tags**: Press Ctrl+K or click "Add Tags" to assign tags and memos
4. **Review Segments**: View all coded segments in the sidebar
5. **Filter Data**: Use the Filter tab to view segments by specific tags
6. **Export Data**: Use the Export tab to download your coded data as CSV

## Limits

- Maximum 10 segments per document
- Single-session use (data cleared on page refresh)
- Text selection within single paragraphs only
- No overlap allowed within the same paragraph

## Keyboard Shortcuts

- `Ctrl+K`: Open tag picker for selected text
- `Ctrl+S`: Save data manually
- `Ctrl+E`: Export CSV
- `Ctrl+C`: Clear filters
- `Esc`: Cancel selection/close modals

## Technology Stack

- React 18 + TypeScript
- Zustand for state management
- Tailwind CSS for styling
- IndexedDB for browser storage
- Vite for development and building

## CSV Export Format

The app exports data with the following columns:
- `document_title`: Title of the document
- `student_identifier`: Optional student name/ID
- `paragraph_index`: Paragraph number (0-based)
- `start_char`: Start character position
- `end_char`: End character position
- `text_snippet`: Selected text (max 280 chars)
- `tags`: Tags separated by | (pipe)
- `memo`: Optional memo text
- `created_at_iso`: ISO timestamp

## Development

```bash
npm install
npm run dev
```

## Building

```bash
npm run build
```

## License

MIT License - feel free to use for educational purposes.
