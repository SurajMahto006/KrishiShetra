import React from 'react';
import { Truck, Satellite, Thermometer, ShieldCheck, MapPin } from 'lucide-react';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';

export const BuyerLogistics = () => {
  const shipments = [
    { id: 'TRIP-9021', carrier: 'Kisan Express Transporters', truck: 'MH-15-EG-8842 (Multi-Axle Reefer)', route: 'Nashik Central Godown ➔ Navi Mumbai APMC', commodity: 'Red Onion Export Graded (60 MT)', temp: '22°C (Controlled)', status: 'In Transit', gpsSpeed: '58 km/h', tollCrossed: 'Kasara Ghat Toll Plaza', eta: 'Today, 8:30 PM' },
    { id: 'TRIP-9018', carrier: 'Maha Logistics Fleet', truck: 'MH-12-Q-4410 (Reefer 32ft)', route: 'Dindori Processing Hub ➔ Pune Industrial Area', commodity: 'Tomato Hybrid (30 MT)', temp: '14°C (Cold-Chain Active)', status: 'In Transit', gpsSpeed: '64 km/h', tollCrossed: 'Narayangaon Toll', eta: 'Tomorrow, 6:00 AM' }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            Logistics Radar & Reefer Cold-Chain Tracking
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            AIS-140 GPS telemetry, real-time cargo temperature monitoring, and electronic proof of delivery.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {shipments.map((trip) => (
          <Card key={trip.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--ks-evergreen)' }}>{trip.id}</span>
                  <StatusBadge status={trip.status} />
                  <span className="ks-badge ks-badge--info"><Satellite size={12} /> AIS-140 GPS Live</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--ks-text-muted)' }}>
                  Carrier: <strong style={{ color: 'var(--ks-charcoal)' }}>{trip.carrier}</strong> · {trip.truck}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>Estimated Delivery</div>
                <div style={{ fontWeight: 800, color: 'var(--ks-sage-dark)', fontSize: '15px' }}>{trip.eta}</div>
              </div>
            </div>

            <div style={{ padding: '12px 14px', background: 'var(--ks-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ks-border-subtle)', marginBottom: '14px' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ks-charcoal)', marginBottom: 2 }}>
                <MapPin size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> {trip.route}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--ks-text-muted)' }}>
                Cargo: {trip.commodity} · Last Waypoint: <strong style={{ color: 'var(--ks-charcoal)' }}>{trip.tollCrossed}</strong>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '12.5px' }}>
              <div style={{ padding: '8px 12px', background: 'var(--ks-surface-pale-sage-light)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--ks-border-sage)' }}>
                <span style={{ color: 'var(--ks-text-muted)' }}>REEFER TEMP:</span> <strong style={{ color: 'var(--ks-sage-dark)' }}>{trip.temp}</strong>
              </div>
              <div style={{ padding: '8px 12px', background: 'var(--ks-surface-pale-sage-light)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--ks-border-sage)' }}>
                <span style={{ color: 'var(--ks-text-muted)' }}>TELEMETRY SPEED:</span> <strong style={{ color: 'var(--ks-charcoal)' }}>{trip.gpsSpeed}</strong>
              </div>
              <div style={{ padding: '8px 12px', background: 'var(--ks-surface-pale-sage-light)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--ks-border-sage)' }}>
                <span style={{ color: 'var(--ks-text-muted)' }}>CARGO STATUS:</span> <strong style={{ color: 'var(--status-success-text)' }}>Normal & Sealed</strong>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BuyerLogistics;
