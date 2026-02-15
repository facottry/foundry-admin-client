import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Save, AlertCircle, CheckCircle, Smartphone, Layout, Eye, X, Wand2 } from 'lucide-react';

const PromoSettings = () => {
    const [activeTab, setActiveTab] = useState('popup'); // 'popup' | 'marquee'
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [showPopupPreview, setShowPopupPreview] = useState(false);

    const [popupConfig, setPopupConfig] = useState({
        enabled: false,
        htmlContent: '',
        frequencyHours: 24
    });

    const [marqueeConfig, setMarqueeConfig] = useState({
        enabled: false,
        htmlContent: '',
        linkUrl: '',
        backgroundColor: '#111827',
        textColor: '#ffffff'
    });

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            setLoading(true);
            const configs = await api.get('/admin/promotion-config');

            // Parse Popup Config
            if (configs && configs.PROMO_POPUP_CONFIG) {
                try {
                    const parsed = typeof configs.PROMO_POPUP_CONFIG === 'string'
                        ? JSON.parse(configs.PROMO_POPUP_CONFIG)
                        : configs.PROMO_POPUP_CONFIG;
                    setPopupConfig(prev => ({ ...prev, ...parsed }));
                } catch (e) {
                    console.error('Error parsing popup config', e);
                }
            }

            // Parse Marquee Config
            if (configs.MARQUEE_CONFIG) {
                try {
                    const parsed = typeof configs.MARQUEE_CONFIG === 'string'
                        ? JSON.parse(configs.MARQUEE_CONFIG)
                        : configs.MARQUEE_CONFIG;
                    setMarqueeConfig(prev => ({ ...prev, ...parsed }));
                } catch (e) {
                    console.error('Error parsing marquee config', e);
                }
            }
        } catch (error) {
            console.error('Failed to fetch settings', error);
            setMessage({ type: 'error', text: 'Failed to load settings.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setMessage(null);

            // Save Popup Config
            await api.post('/admin/promotion-config', {
                key: 'PROMO_POPUP_CONFIG',
                value: JSON.stringify(popupConfig)
            });

            // Save Marquee Config
            await api.post('/admin/promotion-config', {
                key: 'MARQUEE_CONFIG',
                value: JSON.stringify(marqueeConfig)
            });

            setMessage({ type: 'success', text: 'Settings saved successfully!' });
        } catch (error) {
            console.error('Failed to save settings', error);
            setMessage({ type: 'error', text: 'Failed to save settings.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading settings...</div>;

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === id
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
        >
            <Icon size={18} className="mr-2" />
            {label}
        </button>
    );

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Promotion Settings</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                >
                    <Save size={18} className="mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {message && (
                <div
                    className={`p-4 mb-6 rounded flex items-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                >
                    {message.type === 'success' ? (
                        <CheckCircle size={20} className="mr-2" />
                    ) : (
                        <AlertCircle size={20} className="mr-2" />
                    )}
                    {message.text}
                </div>
            )}

            {/* Tabs Header */}
            <div className="bg-white rounded-t-lg shadow-sm border-b border-gray-200 flex mb-0">
                <TabButton id="popup" label="Promotional Popup" icon={Layout} />
                <TabButton id="marquee" label="Marquee Ribbon" icon={Smartphone} />
            </div>

            {/* Tab Content */}
            <div className="bg-white p-6 rounded-b-lg shadow border-x border-b border-gray-200 min-h-[400px]">
                {/* POPUP TAB */}
                {activeTab === 'popup' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">Popup Configuration</h2>
                                <p className="text-sm text-gray-500">
                                    Configure the full-screen modal shown to users.
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setShowPopupPreview(true)}
                                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                                >
                                    <Eye size={16} className="mr-1" />
                                    Preview
                                </button>
                                <div className="flex items-center">
                                    <label className="mr-3 text-sm font-medium text-gray-700">Enable Popup</label>
                                    <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                        <input
                                            type="checkbox"
                                            name="toggle"
                                            id="toggle-popup"
                                            checked={popupConfig.enabled}
                                            onChange={(e) =>
                                                setPopupConfig({ ...popupConfig, enabled: e.target.checked })
                                            }
                                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                            style={{
                                                top: 0,
                                                left: popupConfig.enabled ? '100%' : '0',
                                                transform: popupConfig.enabled ? 'translateX(-100%)' : 'translateX(0)',
                                                borderColor: popupConfig.enabled ? '#2563EB' : '#E5E7EB'
                                            }}
                                        />
                                        <label
                                            htmlFor="toggle-popup"
                                            className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${popupConfig.enabled ? 'bg-blue-600' : 'bg-gray-300'
                                                }`}
                                        ></label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-700">HTML Content</label>
                                    <button
                                        onClick={() => {
                                            const template = `
<div class="flex flex-col h-full bg-white text-center">
  <!-- Hero Section with Gradient -->
  <div class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-12 text-white flex flex-col justify-center items-center shadow-lg">
    <h1 class="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-md">
      Big Launch! 🚀
    </h1>
    <p class="text-xl opacity-90 font-light tracking-wide">
      Experience the future of workforce management
    </p>
  </div>
  
  <!-- Content Section -->
  <div class="flex-1 p-8 md:p-12 flex flex-col items-center justify-center space-y-6">
    <div class="w-16 h-1 bg-indigo-600 rounded-full mb-2"></div>
    
    <h2 class="text-3xl font-bold text-gray-900 leading-tight">
      Staffium is Live on Clicktory
    </h2>
    
    <p class="text-gray-600 text-lg max-w-lg leading-relaxed">
      Unlock powerful tools designed to simplify your HR processes. Join thousands of founders optimizing their teams today.
    </p>
    
    <div class="pt-6">
      <a href="https://staffium.clicktory.in/" 
         target="_blank"
         class="inline-block px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-full shadow-xl transform transition hover:-translate-y-1 hover:shadow-2xl ring-4 ring-indigo-200">
        Explore Staffium Now
      </a>
    </div>
    
    <p class="text-sm text-gray-400 mt-8">
      Limited time launch offer available.
    </p>
  </div>
</div>`;
                                            setPopupConfig({ ...popupConfig, htmlContent: template });
                                        }}
                                        className="text-xs flex items-center text-purple-600 hover:text-purple-800 font-medium transition-colors"
                                        title="Auto-populate with a beautiful template"
                                    >
                                        <Wand2 size={14} className="mr-1" />
                                        Auto-Fill Template
                                    </button>
                                </div>
                                <textarea
                                    value={popupConfig.htmlContent}
                                    onChange={(e) =>
                                        setPopupConfig({ ...popupConfig, htmlContent: e.target.value })
                                    }
                                    className="w-full h-64 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                                    placeholder="<div class='text-center'><h1>Big Sale!</h1><p>Check it out.</p></div>"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Accepts full HTML. Use inline styles or Tailwind classes.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Frequency (Hours)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={popupConfig.frequencyHours}
                                    onChange={(e) =>
                                        setPopupConfig({
                                            ...popupConfig,
                                            frequencyHours: parseInt(e.target.value) || 0
                                        })
                                    }
                                    className="w-full max-w-xs p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Re-show to same user after X hours. 0 = Every refresh.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* MARQUEE TAB */}
                {activeTab === 'marquee' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">Marquee Configuration</h2>
                                <p className="text-sm text-gray-500">
                                    Configure the scrolling ribbon at the top of the site.
                                </p>
                            </div>
                            <div className="flex items-center">
                                <label className="mr-3 text-sm font-medium text-gray-700">Enable Marquee</label>
                                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                    <input
                                        type="checkbox"
                                        name="toggle"
                                        id="toggle-marquee"
                                        checked={marqueeConfig.enabled}
                                        onChange={(e) =>
                                            setMarqueeConfig({ ...marqueeConfig, enabled: e.target.checked })
                                        }
                                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                        style={{
                                            top: 0,
                                            left: marqueeConfig.enabled ? '100%' : '0',
                                            transform: marqueeConfig.enabled ? 'translateX(-100%)' : 'translateX(0)',
                                            borderColor: marqueeConfig.enabled ? '#2563EB' : '#E5E7EB'
                                        }}
                                    />
                                    <label
                                        htmlFor="toggle-marquee"
                                        className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${marqueeConfig.enabled ? 'bg-blue-600' : 'bg-gray-300'
                                            }`}
                                    ></label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-700">HTML Content</label>
                                    <button
                                        onClick={() => {
                                            const template = `<span class="font-bold mr-2">🚀 New Launch:</span> Staffium is now live on Clicktory! <span class="hidden md:inline ml-2 opacity-90">Manage your workforce like a pro.</span>`;
                                            setMarqueeConfig({
                                                ...marqueeConfig,
                                                htmlContent: template,
                                                linkUrl: 'https://staffium.clicktory.in/',
                                                backgroundColor: '#4338ca', // Indigo-700
                                                textColor: '#ffffff'
                                            });
                                        }}
                                        className="text-xs flex items-center text-purple-600 hover:text-purple-800 font-medium transition-colors"
                                        title="Auto-populate with a beautiful template"
                                    >
                                        <Wand2 size={14} className="mr-1" />
                                        Auto-Fill Template
                                    </button>
                                </div>
                                <textarea
                                    value={marqueeConfig.htmlContent}
                                    onChange={(e) =>
                                        setMarqueeConfig({ ...marqueeConfig, htmlContent: e.target.value })
                                    }
                                    className="w-full h-24 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                                    placeholder="<span>Welcome to our platform!</span>"
                                />
                                <p className="text-xs text-gray-500 mt-1">Accepts raw HTML.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Link URL (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={marqueeConfig.linkUrl}
                                    onChange={(e) =>
                                        setMarqueeConfig({ ...marqueeConfig, linkUrl: e.target.value })
                                    }
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="/pricing or https://example.com"
                                />
                                <p className="text-xs text-gray-500 mt-1">Makes the entire ribbon clickable.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Background Color
                                    </label>
                                    <div className="flex items-center">
                                        <input
                                            type="color"
                                            value={marqueeConfig.backgroundColor}
                                            onChange={(e) =>
                                                setMarqueeConfig({
                                                    ...marqueeConfig,
                                                    backgroundColor: e.target.value
                                                })
                                            }
                                            className="h-10 w-10 border border-gray-300 rounded mr-2 p-1 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={marqueeConfig.backgroundColor}
                                            onChange={(e) =>
                                                setMarqueeConfig({
                                                    ...marqueeConfig,
                                                    backgroundColor: e.target.value
                                                })
                                            }
                                            className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono uppercase"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                                    <div className="flex items-center">
                                        <input
                                            type="color"
                                            value={marqueeConfig.textColor}
                                            onChange={(e) =>
                                                setMarqueeConfig({ ...marqueeConfig, textColor: e.target.value })
                                            }
                                            className="h-10 w-10 border border-gray-300 rounded mr-2 p-1 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={marqueeConfig.textColor}
                                            onChange={(e) =>
                                                setMarqueeConfig({ ...marqueeConfig, textColor: e.target.value })
                                            }
                                            className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono uppercase"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Preview Area */}
                            {marqueeConfig.enabled && (
                                <div className="mt-6">
                                    <span className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wide">
                                        Live Preview
                                    </span>
                                    <div
                                        style={{
                                            backgroundColor: marqueeConfig.backgroundColor,
                                            color: marqueeConfig.textColor,
                                            padding: '12px',
                                            borderRadius: '6px',
                                            textAlign: 'center',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        <div dangerouslySetInnerHTML={{ __html: marqueeConfig.htmlContent }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* POPUP PREVIEW MODAL */}
            {showPopupPreview && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        zIndex: 9999,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '20px'
                    }}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            width: '100%',
                            maxWidth: '800px',
                            height: '80vh',
                            borderRadius: '8px',
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <button
                            onClick={() => setShowPopupPreview(false)}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'rgba(255,255,255,0.8)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                zIndex: 10
                            }}
                        >
                            <X size={20} color="#333" />
                        </button>

                        <div
                            style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: '0'
                            }}
                            dangerouslySetInnerHTML={{
                                __html:
                                    popupConfig.htmlContent ||
                                    '<div class="p-10 text-center text-gray-500">No content configured</div>'
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromoSettings;
