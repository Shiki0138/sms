import { jsx as _jsx } from "react/jsx-runtime";
import React, { useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
// Chart.js最適化設定
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);
// パフォーマンス最適化設定
ChartJS.defaults.animation = {
    duration: 750, // アニメーション時間を短縮
    easing: 'easeOutQuart'
};
ChartJS.defaults.responsive = true;
ChartJS.defaults.maintainAspectRatio = false;
ChartJS.defaults.interaction = {
    intersect: false,
    mode: 'index',
    axis: 'x',
    includeInvisible: false
};
// カラーパレット定義
export const CHART_COLORS = {
    primary: {
        main: 'rgba(59, 130, 246, 0.8)',
        light: 'rgba(59, 130, 246, 0.3)',
        gradient: (ctx) => {
            const chart = ctx.chart;
            const { chartArea } = chart;
            if (!chartArea)
                return 'rgba(59, 130, 246, 0.8)';
            const gradient = chart.ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
            return gradient;
        }
    },
    secondary: {
        main: 'rgba(16, 185, 129, 0.8)',
        light: 'rgba(16, 185, 129, 0.3)'
    },
    success: {
        main: 'rgba(34, 197, 94, 0.8)',
        light: 'rgba(34, 197, 94, 0.3)'
    },
    warning: {
        main: 'rgba(245, 158, 11, 0.8)',
        light: 'rgba(245, 158, 11, 0.3)'
    },
    danger: {
        main: 'rgba(239, 68, 68, 0.8)',
        light: 'rgba(239, 68, 68, 0.3)'
    },
    palette: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(14, 165, 233, 0.8)',
        'rgba(34, 197, 94, 0.8)'
    ]
};
// 基本チャート設定
export const getBaseChartOptions = (type) => {
    const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 10,
                bottom: 10
            }
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    boxWidth: 12,
                    boxHeight: 12,
                    padding: 15,
                    font: {
                        size: 12,
                        family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                cornerRadius: 6,
                displayColors: true,
                boxPadding: 3,
                usePointStyle: true,
                animation: {
                    duration: 200
                }
            }
        },
        elements: {
            point: {
                radius: 4,
                hoverRadius: 6,
                borderWidth: 2
            },
            line: {
                tension: 0.4,
                borderWidth: 2
            },
            bar: {
                borderWidth: 1,
                borderRadius: 4
            }
        }
    };
    // タイプ別の設定
    if (type === 'line' || type === 'bar') {
        baseOptions.scales = {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 11
                    },
                    maxRotation: 45
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    font: {
                        size: 11
                    },
                    padding: 10
                }
            }
        };
    }
    return baseOptions;
};
export const OptimizedLineChart = ({ data, options = {}, height = 300 }) => {
    const optimizedOptions = useMemo(() => ({
        ...getBaseChartOptions('line'),
        ...options,
        animation: {
            duration: 750,
            easing: 'easeOutQuart'
        }
    }), [options]);
    const optimizedData = useMemo(() => ({
        ...data,
        datasets: data.datasets?.map((dataset) => ({
            ...dataset,
            pointBackgroundColor: dataset.pointBackgroundColor || dataset.borderColor,
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: dataset.borderColor,
            pointHoverBorderColor: '#fff'
        }))
    }), [data]);
    return (_jsx("div", { style: { height: `${height}px` }, children: _jsx(Line, { data: optimizedData, options: optimizedOptions }) }));
};
export const OptimizedBarChart = ({ data, options = {}, height = 300 }) => {
    const optimizedOptions = useMemo(() => ({
        ...getBaseChartOptions('bar'),
        ...options,
        animation: {
            duration: 750,
            easing: 'easeOutQuart'
        }
    }), [options]);
    return (_jsx("div", { style: { height: `${height}px` }, children: _jsx(Bar, { data: data, options: optimizedOptions }) }));
};
export const OptimizedDoughnutChart = ({ data, options = {}, height = 300 }) => {
    const optimizedOptions = useMemo(() => ({
        ...getBaseChartOptions('doughnut'),
        ...options,
        cutout: '65%',
        plugins: {
            ...getBaseChartOptions('doughnut').plugins,
            legend: {
                position: 'right',
                labels: {
                    boxWidth: 12,
                    boxHeight: 12,
                    padding: 10,
                    font: {
                        size: 11
                    },
                    generateLabels: (chart) => {
                        const data = chart.data;
                        if (data.labels && data.datasets.length) {
                            return data.labels.map((label, i) => {
                                const dataset = data.datasets[0];
                                const value = dataset.data[i];
                                const total = dataset.data.reduce((sum, val) => sum + val, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return {
                                    text: `${label}: ${percentage}%`,
                                    fillStyle: dataset.backgroundColor ? dataset.backgroundColor[i] : '#ccc',
                                    hidden: false,
                                    index: i
                                };
                            });
                        }
                        return [];
                    }
                }
            },
            tooltip: {
                ...getBaseChartOptions('doughnut').plugins?.tooltip,
                callbacks: {
                    label: (context) => {
                        const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                        const percentage = ((context.raw / total) * 100).toFixed(1);
                        return `${context.label}: ${context.formattedValue} (${percentage}%)`;
                    }
                }
            }
        },
        animation: {
            duration: 750,
            easing: 'easeOutQuart'
        }
    }), [options]);
    return (_jsx("div", { style: { height: `${height}px` }, children: _jsx(Doughnut, { data: data, options: optimizedOptions }) }));
};
// チャートデータ最適化ユーティリティ
export const optimizeChartData = (rawData, maxDataPoints = 50) => {
    if (rawData.length <= maxDataPoints)
        return rawData;
    const interval = Math.ceil(rawData.length / maxDataPoints);
    return rawData.filter((_, index) => index % interval === 0);
};
// 大量データ用サンプリング関数
export const sampleData = (data, maxPoints = 100) => {
    if (data.length <= maxPoints)
        return data;
    const step = data.length / maxPoints;
    const sampled = [];
    for (let i = 0; i < data.length; i += step) {
        sampled.push(data[Math.floor(i)]);
    }
    return sampled;
};
// 色生成ユーティリティ
export const generateColors = (count, opacity = 0.8) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
        const hue = (i * 360) / count;
        colors.push(`hsla(${hue}, 70%, 50%, ${opacity})`);
    }
    return colors;
};
// グラデーション生成
export const createGradient = (ctx, chartArea, colorStart, colorEnd) => {
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, colorStart);
    gradient.addColorStop(1, colorEnd);
    return gradient;
};
// 数値フォーマッタ
export const formatters = {
    currency: (value) => `¥${value.toLocaleString()}`,
    percentage: (value) => `${value.toFixed(1)}%`,
    number: (value) => value.toLocaleString(),
    compact: (value) => {
        if (value >= 1000000)
            return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000)
            return `${(value / 1000).toFixed(1)}K`;
        return value.toString();
    }
};
// パフォーマンス監視フック
export const useChartPerformance = () => {
    const [renderTime, setRenderTime] = React.useState(0);
    const measurePerformance = React.useCallback((callback) => {
        const start = performance.now();
        callback();
        const end = performance.now();
        setRenderTime(end - start);
    }, []);
    return { renderTime, measurePerformance };
};
// メモ化されたチャートコンポーネント
export const MemoizedLineChart = React.memo(OptimizedLineChart);
export const MemoizedBarChart = React.memo(OptimizedBarChart);
export const MemoizedDoughnutChart = React.memo(OptimizedDoughnutChart);
export default {
    OptimizedLineChart: MemoizedLineChart,
    OptimizedBarChart: MemoizedBarChart,
    OptimizedDoughnutChart: MemoizedDoughnutChart,
    CHART_COLORS,
    getBaseChartOptions,
    optimizeChartData,
    sampleData,
    generateColors,
    createGradient,
    formatters,
    useChartPerformance
};
