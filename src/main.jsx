import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import App from './App.jsx'
import './index.css'
import 'antd/dist/reset.css'

// Configure Ant Design theme
const theme = {
  token: {
    colorPrimary: '#0c87eb',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#0ea5e9',
    borderRadius: 8,
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
  components: {
    Table: {
      borderRadius: 8,
      headerBg: 'transparent',
      headerColor: '#475569',
      rowHoverBg: 'rgba(0, 0, 0, 0.02)',
    },
    Select: {
      borderRadius: 8,
    },
    DatePicker: {
      borderRadius: 8,
    },
    Button: {
      borderRadius: 8,
    },
    Card: {
      borderRadius: 8,
    },
    Modal: {
      borderRadius: 12,
    },
    Input: {
      borderRadius: 8,
    }
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider theme={theme}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
)
