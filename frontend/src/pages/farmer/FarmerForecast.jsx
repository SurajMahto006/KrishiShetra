import React, { useState } from 'react';
import { Sparkles, TrendingUp, Calendar, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatCard from '../../components/common/StatCard';

export const FarmerForecast = () => {
  const [selectedCrop, setSelectedCrop] = useState('Onion (Garwa)');

  const forecasts = {
    'Onion (Garwa)': {
      currentPrice: '₹2,450 / Qtl',
      predictedPrice15d: '₹2,820 / Qtl',
      predictedPrice30d: '₹3,150 / Qtl',
      action: 'HOLD FOR 12-18 DAYS',
      confidence: '89% High Confidence',
      reasoning: 'Arrivals in major Nashik and Pimpalgaon mandis are decreasing by 18% weekly due to end of harvest season, while export demand to GCC countries is trending upwards.',
      advisory: [
        'Ensure proper ventilation in storage godowns to prevent black mould (Aspergillus niger).',
        'Consider staggering sales across the third week of the month to capture peak price window.',
        'Moisture content should be maintained below 12% before dispatch.'
      ]
    },
    'Soybean (Yellow)': {
      currentPrice: '₹4,890 / Qtl',
      predictedPrice15d: '₹5,020 / Qtl',
      predictedPrice30d: '₹4,950 / Qtl',
      action: 'SELL IN NEXT 7 DAYS',
      confidence: '82% Moderate Confidence',
      reasoning: 'Global edible oil imports are stabilizing, leading to potential ceiling on domestic crush margins.',
      advisory: [
        'Liquidate lots exceeding 100 quintals at current favorable spot prices above MSP.',
        'Verify moisture levels below 10% to prevent dockage discounts by oil solvent extractors.'
      ]
    }
  };

  const current = forecasts[selectedCrop] || forecasts['Onion (Garwa)'];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            AI Market Price Forecast & Crop Advisory
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Predictive machine learning models trained on 10 years of Agmarknet arrivals, rainfall, and export indices.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            className="ks-select"
            style={{ width: '220px', fontWeight: 600 }}
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
          >
            <option value="Onion (Garwa)">Onion (Garwa)</option>
            <option value="Soybean (Yellow)">Soybean (Yellow)</option>
          </select>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <StatCard
          label="Current Spot Rate"
          value={current.currentPrice}
          subtext="APMC Benchmark Today"
          variant="sage"
          icon={TrendingUp}
        />
        <StatCard
          label="15-Day AI Forecast"
          value={current.predictedPrice15d}
          subtext="+15.1% projected upward trajectory"
          variant="amber"
          icon={Sparkles}
        />
        <StatCard
          label="Recommended Strategy"
          value={current.action}
          subtext={current.confidence}
          variant="blue"
          icon={CheckCircle}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        <Card title={`Intelligence Summary: ${selectedCrop}`} subtitle="Key macro market drivers and demand factors">
          <div style={{ padding: '16px', background: 'var(--ks-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ks-border-subtle)', marginBottom: '16px', lineHeight: '1.6', fontSize: '14px' }}>
            <p style={{ color: 'var(--ks-charcoal)' }}>{current.reasoning}</p>
          </div>

          <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ks-evergreen)', marginBottom: '12px' }}>
            Actionable Harvest & Storage Guidelines
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {current.advisory.map((adv, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13.5px' }}>
                <CheckCircle size={16} color="var(--ks-sage)" style={{ marginTop: 2, flexShrink: 0 }} />
                <span>{adv}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Regional Weather & Harvest Impact" subtitle="7-Day micro-climate forecast for major production belts">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { region: 'Nashik Belt', condition: 'Clear Sky & Dry (28°C / 14°C)', status: 'Favorable for onion curing' },
              { region: 'Marathwada', condition: 'Moderate Humidity (31°C / 19°C)', status: 'Optimum for soybean storage' },
              { region: 'Western Maharashtra', condition: 'Isolated Light Showers', status: 'Cover transit vehicles with tarpaulin' }
            ].map((w, idx) => (
              <div key={idx} style={{ padding: '12px 14px', background: 'var(--ks-surface-pale-sage-light)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ks-border-sage)' }}>
                <div style={{ fontWeight: 700, color: 'var(--ks-evergreen)', fontSize: '13.5px' }}>{w.region}</div>
                <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>{w.condition}</div>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ks-sage-dark)', marginTop: '4px' }}>✓ {w.status}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FarmerForecast;
