import React from 'react';
import { Truck, Satellite, Thermometer, MapPin, CheckCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';

export const TransporterTrips = () => {
  const activeTrips = [
    { id: 'TRP-882', vehicle: 'MH-15-EG-8842 (32ft Reefer)', driver: 'Suresh More (+91 98220 99881)', route: 'Lasalgaon Mandi ➔ JNPT Port, Navi Mumbai', cargo: 'Onion Garwa (28 MT)', temp: '22°C (Cold-Chain Normal)', speed: '58 km/h', tollCrossed: 'Kasara Ghat Toll Plaza', eta: 'Today, 8:30 PM', status: 'In Transit' },
    { id: 'TRP-880', vehicle: 'MH-12-Q-4410 (Reefer Multi-Axle)', driver: 'Kailash Jadhav (+91 94231 44552)', route: 'Pimpalgaon APMC ➔ Azadpur Delhi', cargo: 'Tomato Hybrid (22 MT)', temp: '14°C (Controlled Temp)', speed: '62 km/h', tollCrossed: 'Dhule Bypass Toll', eta: 'Tomorrow, 2:00 PM', status: 'In Transit' }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            Active Transit Trips & Fleet Telemetry Radar
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Real-time monitoring of trucks en route to wholesale mandis and export ports.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {activeTrips.map((trip) => (
          <Card key={trip.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--ks-evergreen)' }}>{trip.id}</span>
                  <StatusBadge status={trip.status} />
                  <span className="ks-badge ks-badge--info"><Satellite size={12} /> AIS-140 Live</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--ks-text-muted)' }}>
                  Vehicle: <strong style={{ color: 'var(--ks-charcoal)' }}>{trip.vehicle}</strong> · Driver: {trip.driver}
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
                Cargo: {trip.cargo} · Last Toll: <strong style={{ color: 'var(--ks-charcoal)' }}>{trip.tollCrossed}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12, fontSize: '12.5px' }}>
                <span className="ks-badge ks-badge--success"><Thermometer size={12} /> {trip.temp}</span>
                <span className="ks-badge ks-badge--info"><Satellite size={12} /> Speed: {trip.speed}</span>
              </div>
              <Button variant="primary" size="sm" icon={CheckCircle} onClick={() => alert('Delivery confirmation code requested.')}>
                Confirm Mandi Drop
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TransporterTrips;
