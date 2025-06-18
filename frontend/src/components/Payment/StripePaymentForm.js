import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { CreditCard, DollarSign, Lock, AlertCircle, CheckCircle, Loader, Calendar, User, MapPin } from 'lucide-react';
import { useAutoSave } from '../../hooks/useAutoSave';
import AutoSaveIndicator from '../Common/AutoSaveIndicator';
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');
const PaymentForm = ({ amount, customerId, reservationId, onSuccess, onError, metadata, splitPayment }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [clientSecret, setClientSecret] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState('idle');
    const [errorMessage, setErrorMessage] = useState(null);
    const [formData, setFormData] = useState({
        customerInfo: {
            name: '',
            email: '',
            phone: ''
        },
        billingAddress: {
            line1: '',
            line2: '',
            city: '',
            state: '',
            postal_code: '',
            country: 'JP'
        },
        saveCard: false,
        receiptEmail: '',
        paymentMethod: 'card',
        splitPayment: splitPayment?.enabled || false,
        notes: ''
    });
    // 自動保存機能
    const { save: saveFormData, isAutoSaving, lastSaved, hasUnsavedChanges } = useAutoSave(formData, {
        onSave: async (data) => {
            // フォームデータの自動保存（個人情報は暗号化）
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/payments/save-form`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    customerId,
                    reservationId,
                    formData: data,
                    encrypted: true
                })
            });
            if (!response.ok) {
                throw new Error('フォームデータの保存に失敗しました');
            }
        },
        storageKey: `payment-form-${customerId}`,
        delay: 3000 // 3秒遅延
    });
    // PaymentIntent作成
    useEffect(() => {
        if (amount > 0) {
            createPaymentIntent();
        }
    }, [amount, customerId, formData.paymentMethod]);
    const createPaymentIntent = async () => {
        try {
            const actualAmount = splitPayment?.enabled && formData.splitPayment
                ? splitPayment.depositAmount || amount
                : amount;
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/payments/create-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    amount: actualAmount,
                    currency: 'jpy',
                    customerId,
                    reservationId,
                    paymentMethod: formData.paymentMethod,
                    metadata: {
                        ...metadata,
                        split_payment: formData.splitPayment.toString(),
                        deposit_amount: splitPayment?.depositAmount?.toString(),
                        remaining_amount: splitPayment?.remainingAmount?.toString()
                    }
                })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || '決済の準備に失敗しました');
            }
            setClientSecret(data.clientSecret);
        }
        catch (error) {
            setErrorMessage(error instanceof Error ? error.message : '決済の準備中にエラーが発生しました');
            onError(error instanceof Error ? error.message : '決済準備エラー');
        }
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements || !clientSecret) {
            setErrorMessage('決済システムの初期化中です。しばらくお待ちください。');
            return;
        }
        setIsProcessing(true);
        setPaymentStatus('processing');
        setErrorMessage(null);
        try {
            let result;
            if (formData.paymentMethod === 'card') {
                // カード決済
                const confirmResult = await stripe.confirmPayment({
                    elements,
                    confirmParams: {
                        return_url: `${window.location.origin}/payment/confirmation`,
                        receipt_email: formData.receiptEmail || formData.customerInfo.email,
                        payment_method_data: {
                            billing_details: {
                                name: formData.customerInfo.name,
                                email: formData.customerInfo.email,
                                phone: formData.customerInfo.phone,
                                address: formData.billingAddress
                            }
                        }
                    },
                    redirect: 'if_required'
                });
                if (confirmResult.error) {
                    throw new Error(getJapaneseErrorMessage(confirmResult.error.code, confirmResult.error.message));
                }
                result = confirmResult;
            }
            else if (formData.paymentMethod === 'konbini') {
                // コンビニ決済
                const confirmResult = await stripe.confirmPayment({
                    elements,
                    confirmParams: {
                        return_url: `${window.location.origin}/payment/confirmation`,
                        payment_method_data: {
                            billing_details: {
                                name: formData.customerInfo.name,
                                email: formData.customerInfo.email
                            }
                        }
                    }
                });
                if (confirmResult.error) {
                    throw new Error(getJapaneseErrorMessage(confirmResult.error.code, confirmResult.error.message));
                }
                result = confirmResult;
            }
            if (result && 'paymentIntent' in result && result.paymentIntent?.status === 'succeeded') {
                setPaymentStatus('success');
                onSuccess(result.paymentIntent);
                // 成功時は保存されたフォームデータを削除
                localStorage.removeItem(`payment-form-${customerId}`);
            }
            else if (result && 'paymentIntent' in result && result.paymentIntent?.status === 'requires_action') {
                // 追加認証が必要（3D Secure等）
                setPaymentStatus('processing');
                setErrorMessage('追加認証が必要です。画面の指示に従ってください。');
            }
            else {
                throw new Error('決済処理が完了しませんでした。');
            }
        }
        catch (error) {
            setPaymentStatus('error');
            const errorMsg = error instanceof Error ? error.message : '決済処理中にエラーが発生しました';
            setErrorMessage(errorMsg);
            onError(errorMsg);
        }
        finally {
            setIsProcessing(false);
        }
    };
    const getJapaneseErrorMessage = (code, message) => {
        const errorMessages = {
            'card_declined': 'カードが拒否されました。別のカードをお試しください。',
            'insufficient_funds': '残高不足です。',
            'incorrect_cvc': 'セキュリティコードが正しくありません。',
            'expired_card': 'カードの有効期限が切れています。',
            'processing_error': '決済処理中にエラーが発生しました。',
            'authentication_required': '本人認証が必要です。',
            'amount_too_large': '金額が上限を超えています。',
            'amount_too_small': '金額が最小額を下回っています。'
        };
        return errorMessages[code || ''] || message || '決済処理中にエラーが発生しました。';
    };
    const updateFormData = (field, value) => {
        setFormData(prev => {
            const keys = field.split('.');
            if (keys.length === 1) {
                return { ...prev, [field]: value };
            }
            else {
                return {
                    ...prev,
                    [keys[0]]: {
                        ...prev[keys[0]],
                        [keys[1]]: value
                    }
                };
            }
        });
    };
    const actualAmount = splitPayment?.enabled && formData.splitPayment
        ? splitPayment.depositAmount || amount
        : amount;
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex justify-end", children: _jsx(AutoSaveIndicator, { isAutoSaving: isAutoSaving, lastSaved: lastSaved, hasUnsavedChanges: hasUnsavedChanges }) }), _jsx("div", { className: "bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(DollarSign, { className: "w-6 h-6 text-blue-600 mr-2" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900", children: "\u304A\u652F\u6255\u3044\u91D1\u984D" }), splitPayment?.enabled && (_jsx("p", { className: "text-sm text-gray-600", children: formData.splitPayment ? '前払い金額' : '全額支払い' }))] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-2xl font-bold text-blue-600", children: ["\u00A5", actualAmount.toLocaleString()] }), splitPayment?.enabled && formData.splitPayment && (_jsxs("div", { className: "text-sm text-gray-500", children: ["\u6B8B\u984D: \u00A5", (splitPayment.remainingAmount || 0).toLocaleString()] }))] })] }) }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 mb-4 flex items-center", children: [_jsx(User, { className: "w-5 h-5 mr-2 text-gray-600" }), "\u304A\u5BA2\u69D8\u60C5\u5831"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u304A\u540D\u524D *" }), _jsx("input", { type: "text", required: true, value: formData.customerInfo.name, onChange: (e) => updateFormData('customerInfo.name', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "\u5C71\u7530 \u592A\u90CE" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9 *" }), _jsx("input", { type: "email", required: true, value: formData.customerInfo.email, onChange: (e) => updateFormData('customerInfo.email', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "example@email.com" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u96FB\u8A71\u756A\u53F7" }), _jsx("input", { type: "tel", value: formData.customerInfo.phone, onChange: (e) => updateFormData('customerInfo.phone', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "090-1234-5678" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u9818\u53CE\u66F8\u9001\u4FE1\u5148" }), _jsx("input", { type: "email", value: formData.receiptEmail, onChange: (e) => updateFormData('receiptEmail', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "\u7A7A\u6B04\u306E\u5834\u5408\u306F\u4E0A\u8A18\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u306B\u9001\u4FE1" })] })] })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 mb-4 flex items-center", children: [_jsx(CreditCard, { className: "w-5 h-5 mr-2 text-gray-600" }), "\u304A\u652F\u6255\u3044\u65B9\u6CD5"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4", children: [_jsxs("button", { type: "button", onClick: () => updateFormData('paymentMethod', 'card'), className: `p-4 border-2 rounded-lg text-center transition-all ${formData.paymentMethod === 'card'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 hover:border-gray-300'}`, children: [_jsx(CreditCard, { className: "w-6 h-6 mx-auto mb-2" }), _jsx("div", { className: "font-medium", children: "\u30AF\u30EC\u30B8\u30C3\u30C8\u30AB\u30FC\u30C9" }), _jsx("div", { className: "text-xs text-gray-500", children: "\u5373\u5EA7\u6C7A\u6E08" })] }), _jsxs("button", { type: "button", onClick: () => updateFormData('paymentMethod', 'konbini'), className: `p-4 border-2 rounded-lg text-center transition-all ${formData.paymentMethod === 'konbini'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 hover:border-gray-300'}`, children: [_jsx(MapPin, { className: "w-6 h-6 mx-auto mb-2" }), _jsx("div", { className: "font-medium", children: "\u30B3\u30F3\u30D3\u30CB\u6C7A\u6E08" }), _jsx("div", { className: "text-xs text-gray-500", children: "\u5F8C\u65E5\u652F\u6255\u3044" })] }), _jsxs("button", { type: "button", onClick: () => updateFormData('paymentMethod', 'bank_transfer'), className: `p-4 border-2 rounded-lg text-center transition-all ${formData.paymentMethod === 'bank_transfer'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 hover:border-gray-300'}`, children: [_jsx(Calendar, { className: "w-6 h-6 mx-auto mb-2" }), _jsx("div", { className: "font-medium", children: "\u9280\u884C\u632F\u8FBC" }), _jsx("div", { className: "text-xs text-gray-500", children: "\u5F8C\u65E5\u652F\u6255\u3044" })] })] }), splitPayment?.enabled && (_jsx("div", { className: "mb-4", children: _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: formData.splitPayment, onChange: (e) => updateFormData('splitPayment', e.target.checked), className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsxs("span", { className: "ml-2 text-sm text-gray-700", children: ["\u5206\u5272\u6255\u3044\uFF08\u524D\u6255\u3044: \u00A5", (splitPayment.depositAmount || 0).toLocaleString(), "\u3001 \u6B8B\u984D: \u00A5", (splitPayment.remainingAmount || 0).toLocaleString(), "\uFF09"] })] }) }))] }), clientSecret && (_jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 mb-4 flex items-center", children: [_jsx(Lock, { className: "w-5 h-5 mr-2 text-green-600" }), "\u6C7A\u6E08\u60C5\u5831"] }), formData.paymentMethod === 'card' ? (_jsxs(_Fragment, { children: [_jsx(PaymentElement, { options: {
                                            layout: 'tabs',
                                            defaultValues: {
                                                billingDetails: {
                                                    name: formData.customerInfo.name,
                                                    email: formData.customerInfo.email,
                                                    phone: formData.customerInfo.phone
                                                }
                                            }
                                        } }), _jsx("div", { className: "mt-4", children: _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: formData.saveCard, onChange: (e) => updateFormData('saveCard', e.target.checked), className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "\u6B21\u56DE\u4EE5\u964D\u306E\u305F\u3081\u306B\u6C7A\u6E08\u60C5\u5831\u3092\u4FDD\u5B58\u3059\u308B" })] }) })] })) : (_jsxs("div", { className: "text-center py-8", children: [_jsxs("div", { className: "text-gray-600 mb-2", children: [formData.paymentMethod === 'konbini' && '決済完了後、コンビニでお支払いいただけます。', formData.paymentMethod === 'bank_transfer' && '決済完了後、振込先情報をお送りします。'] }), _jsxs("div", { className: "text-sm text-gray-500", children: ["\u304A\u652F\u6255\u3044\u671F\u9650: ", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP')] })] }))] })), _jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u5099\u8003\u30FB\u7279\u8A18\u4E8B\u9805" }), _jsx("textarea", { value: formData.notes, onChange: (e) => updateFormData('notes', e.target.value), rows: 3, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "\u3054\u8981\u671B\u3084\u3054\u8CEA\u554F\u304C\u3054\u3056\u3044\u307E\u3057\u305F\u3089\u3054\u8A18\u5165\u304F\u3060\u3055\u3044" })] }), errorMessage && (_jsxs("div", { className: "bg-red-50 border border-red-200 rounded-md p-4 flex items-center", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-red-500 mr-2 flex-shrink-0" }), _jsx("span", { className: "text-red-700 text-sm", children: errorMessage })] })), _jsx("button", { type: "submit", disabled: !stripe || !clientSecret || isProcessing, className: `w-full py-4 px-6 rounded-lg font-semibold text-white transition-all ${isProcessing
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50'}`, children: isProcessing ? (_jsxs("div", { className: "flex items-center justify-center", children: [_jsx(Loader, { className: "w-5 h-5 animate-spin mr-2" }), "\u6C7A\u6E08\u51E6\u7406\u4E2D..."] })) : (_jsxs("div", { className: "flex items-center justify-center", children: [paymentStatus === 'success' ? (_jsx(CheckCircle, { className: "w-5 h-5 mr-2" })) : (_jsx(Lock, { className: "w-5 h-5 mr-2" })), paymentStatus === 'success'
                                    ? '決済完了'
                                    : `¥${actualAmount.toLocaleString()} を決済する`] })) }), _jsxs("div", { className: "text-center text-xs text-gray-500", children: [_jsx(Lock, { className: "w-4 h-4 inline mr-1" }), "\u304A\u5BA2\u69D8\u306E\u6C7A\u6E08\u60C5\u5831\u306FSSL\u6697\u53F7\u5316\u306B\u3088\u308A\u4FDD\u8B77\u3055\u308C\u3066\u3044\u307E\u3059\u3002", _jsx("br", {}), "Stripe\u793E\u306E\u56FD\u969B\u30BB\u30AD\u30E5\u30EA\u30C6\u30A3\u57FA\u6E96\uFF08PCI DSS\uFF09\u306B\u6E96\u62E0\u3057\u305F\u5B89\u5168\u306A\u6C7A\u6E08\u30B7\u30B9\u30C6\u30E0\u3092\u4F7F\u7528\u3057\u3066\u3044\u307E\u3059\u3002"] })] })] }));
};
const StripePaymentForm = (props) => {
    const options = {
        mode: 'payment',
        amount: props.amount,
        currency: props.currency || 'jpy',
        appearance: {
            theme: 'stripe',
            variables: {
                colorPrimary: '#2563eb',
                colorBackground: '#ffffff',
                colorText: '#1f2937',
                colorDanger: '#dc2626',
                fontFamily: 'Inter, system-ui, sans-serif',
                spacingUnit: '4px',
                borderRadius: '6px'
            }
        },
        paymentMethodCreation: 'manual',
        paymentMethodTypes: ['card', 'konbini', 'customer_balance']
    };
    return (_jsx(Elements, { stripe: stripePromise, options: options, children: _jsx(PaymentForm, { ...props }) }));
};
export default StripePaymentForm;
