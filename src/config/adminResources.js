// Schema describing every admin-manageable collection: the fields shown in
// the add/edit form (RecordForm.jsx) and the columns shown in the list
// (RecordTable.jsx). Keeping this in one place means the form and table for
// every resource stay in sync, and adding a new field is a one-line change.
//
// Server-side validation lives separately in server/validators.js — this
// file only drives the UI. Never rely on this alone for security.

export const adminResources = {
  donations: {
    key: 'donations',
    labelHindi: 'दान',
    labelEnglish: 'Donations',
    addLabel: '+ दान जोड़ें',
    idPrefix: 'DON',
    searchable: true,
    searchPlaceholder: 'दानदाता का नाम खोजें...',
    dateRangeFilter: true,
    categoryFilter: null,
    fields: [
      { name: 'name', label: 'दानदाता का नाम', type: 'text', required: true },
      { name: 'anonymous', label: 'Anonymous के रूप में दिखाएं', type: 'checkbox' },
      { name: 'amount', label: 'राशि (₹)', type: 'number', required: true, min: 1 },
      { name: 'date', label: 'तारीख', type: 'date', required: true },
      { name: 'purpose', label: 'उद्देश्य (वैकल्पिक)', type: 'text' },
      { name: 'note', label: 'टिप्पणी (वैकल्पिक)', type: 'textarea' },
    ],
    columns: [
      { key: 'name', label: 'नाम' },
      { key: 'amount', label: 'राशि', align: 'right', format: 'currency' },
      { key: 'date', label: 'तारीख', format: 'date' },
      { key: 'purpose', label: 'उद्देश्य' },
    ],
  },

  expenses: {
    key: 'expenses',
    labelHindi: 'खर्च',
    labelEnglish: 'Expenses',
    addLabel: '+ खर्च जोड़ें',
    idPrefix: 'EXP',
    searchable: true,
    searchPlaceholder: 'खर्च का विवरण खोजें...',
    dateRangeFilter: true,
    categoryFilter: {
      name: 'category',
      options: ['पंडाल', 'पूजा सामग्री', 'सजावट एवं लाइट', 'प्रसाद', 'सांस्कृतिक कार्यक्रम', 'अन्य'],
    },
    fields: [
      { name: 'title', label: 'खर्च का विवरण', type: 'text', required: true },
      {
        name: 'category',
        label: 'श्रेणी',
        type: 'select',
        required: true,
        options: ['पंडाल', 'पूजा सामग्री', 'सजावट एवं लाइट', 'प्रसाद', 'सांस्कृतिक कार्यक्रम', 'अन्य'],
      },
      { name: 'amount', label: 'राशि (₹)', type: 'number', required: true, min: 1 },
      { name: 'date', label: 'तारीख', type: 'date', required: true },
      { name: 'note', label: 'टिप्पणी (वैकल्पिक)', type: 'textarea' },
    ],
    columns: [
      { key: 'title', label: 'विवरण' },
      { key: 'category', label: 'श्रेणी' },
      { key: 'amount', label: 'राशि', align: 'right', format: 'currency' },
      { key: 'date', label: 'तारीख', format: 'date' },
    ],
  },

  events: {
    key: 'events',
    labelHindi: 'पूजा कार्यक्रम',
    labelEnglish: 'Programme',
    addLabel: '+ कार्यक्रम जोड़ें',
    idPrefix: 'EVT',
    searchable: false,
    dateRangeFilter: false,
    categoryFilter: null,
    fields: [
      { name: 'name', label: 'कार्यक्रम का नाम', type: 'text', required: true },
      { name: 'date', label: 'तारीख', type: 'date', required: true },
      { name: 'time', label: 'समय', type: 'time', required: true },
      { name: 'location', label: 'स्थान', type: 'text' },
      { name: 'description', label: 'विवरण', type: 'textarea' },
    ],
    columns: [
      { key: 'name', label: 'कार्यक्रम' },
      { key: 'date', label: 'तारीख', format: 'date' },
      { key: 'time', label: 'समय' },
      { key: 'location', label: 'स्थान' },
    ],
  },

  gallery: {
    key: 'gallery',
    labelHindi: 'गैलरी',
    labelEnglish: 'Gallery',
    addLabel: '+ फ़ोटो जोड़ें',
    idPrefix: 'GAL',
    searchable: false,
    dateRangeFilter: false,
    categoryFilter: {
      name: 'category',
      options: ['इस वर्ष की पूजा', 'पिछले वर्ष', 'सजावट', 'सांस्कृतिक कार्यक्रम', 'विसर्जन'],
    },
    fields: [
      {
        name: 'imageUrl',
        label: 'फ़ोटो का URL',
        type: 'text',
        required: true,
        helpText: 'फ़ोटो कहीं और होस्ट करें (जैसे Google Photos/Drive का सार्वजनिक लिंक) और उसका लिंक यहां डालें।',
      },
      { name: 'caption', label: 'कैप्शन', type: 'text' },
      {
        name: 'category',
        label: 'श्रेणी',
        type: 'select',
        required: true,
        options: ['इस वर्ष की पूजा', 'पिछले वर्ष', 'सजावट', 'सांस्कृतिक कार्यक्रम', 'विसर्जन'],
      },
    ],
    columns: [
      { key: 'caption', label: 'कैप्शन' },
      { key: 'category', label: 'श्रेणी' },
    ],
  },

  announcements: {
    key: 'announcements',
    labelHindi: 'सूचनाएं',
    labelEnglish: 'Announcements',
    addLabel: '+ सूचना जोड़ें',
    idPrefix: 'ANN',
    searchable: false,
    dateRangeFilter: false,
    categoryFilter: null,
    fields: [
      { name: 'title', label: 'शीर्षक', type: 'text', required: true },
      { name: 'body', label: 'विवरण', type: 'textarea', required: true },
      { name: 'important', label: 'महत्वपूर्ण सूचना के रूप में दिखाएं', type: 'checkbox' },
    ],
    columns: [
      { key: 'title', label: 'शीर्षक' },
      { key: 'important', label: 'महत्वपूर्ण', format: 'yesno' },
    ],
  },
};

export const adminResourceOrder = ['donations', 'expenses', 'events', 'gallery', 'announcements'];
