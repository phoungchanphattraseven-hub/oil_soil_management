import React from 'react';
import StaffManager from '../components/Fuel/StaffManager';
import { translations } from '../data/translations';

export default function StaffPage({
  staff = [],
  drivers = [],
  onAddStaff,
  onEditStaff,
  onDeleteStaff,
  onSaveSignature,
  stations = [],
  fuelLogs = [],
  lang = 'km',
  userRole = 'user'
}) {
  const t = translations[lang] || translations.km;

  return (
    <div className="page-wrapper" style={{ minHeight: 'calc(100vh - 60px)' }}>
      <StaffManager
        staff={staff}
        drivers={drivers}
        onAddStaff={onAddStaff}
        onEditStaff={onEditStaff}
        onDeleteStaff={onDeleteStaff}
        onSaveSignature={onSaveSignature}
        stations={stations}
        fuelLogs={fuelLogs}
        lang={lang}
      />
    </div>
  );
}
