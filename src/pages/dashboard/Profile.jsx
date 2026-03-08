import { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { API } from '../../api';

const HOUSEHOLD_OPTIONS = ['Just me', 'Partner', 'Kids', 'Roommates', 'Pets'];

function Field({ label, value }) {
    return (
        <div className="profile-field">
            <span className="profile-label">{label}</span>
            <span className="profile-value">
                {value || <em style={{ color: 'var(--text-muted)' }}>Not set</em>}
            </span>
        </div>
    );
}

export default function Profile() {
    const user = useAuth();
    const uid = user?.uid;

    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!uid) return;
        API.getProfile(uid).then(data => {
            setProfile(data ?? {});
            setForm(data ?? {});
        });
    }, [uid]);

    function toggleChip(value) {
        const current = (form.householdMembers ?? '').split(',').map(s => s.trim()).filter(Boolean);
        const next = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        setForm(f => ({ ...f, householdMembers: next.join(', ') }));
    }

    async function handleSave() {
        setSaving(true);
        try {
            await API.saveProfile(uid, form);
            setProfile(form);
            setEditing(false);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div>
            <div className="chores-header">
                <h2 className="page-title">Profile</h2>
                {!editing && (
                    <button className="btn btn-primary btn-sm" onClick={() => { setForm(profile ?? {}); setEditing(true); }}>Edit</button>
                )}
            </div>

            <div className="profile-card">
                <p className="profile-section-title">Home & Cleaning Preferences</p>

                {!editing ? (
                    <>
                        <Field label="Home type" value={profile?.homeType} />
                        <div className="profile-field">
                            <span className="profile-label">Bedrooms</span>
                            <span className="profile-value">
                                {profile?.bedrooms != null && profile?.bedrooms !== ''
                                    ? profile.bedrooms
                                    : <em style={{ color: 'var(--text-muted)' }}>Not set</em>}
                            </span>
                        </div>
                        <div className="profile-field">
                            <span className="profile-label">Bathrooms</span>
                            <span className="profile-value">
                                {profile?.bathrooms != null && profile?.bathrooms !== ''
                                    ? profile.bathrooms
                                    : <em style={{ color: 'var(--text-muted)' }}>Not set</em>}
                            </span>
                        </div>
                        <Field label="Laundry" value={profile?.laundryType} />
                        <Field label="Household" value={profile?.householdMembers} />
                        <Field label="Cleaning style" value={profile?.cleaningStyle} />
                        <Field label="Pain points" value={profile?.painPoints} />
                    </>
                ) : (
                    <div className="profile-form">
                        <div className="form-group">
                            <label>Home type</label>
                            <input
                                type="text"
                                value={form.homeType ?? ''}
                                onChange={e => setForm(f => ({ ...f, homeType: e.target.value }))}
                            />
                        </div>
                        <div className="profile-row-two">
                            <div className="form-group">
                                <label>Bedrooms</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.bedrooms ?? ''}
                                    onChange={e => setForm(f => ({ ...f, bedrooms: e.target.value }))}
                                />
                            </div>
                            <div className="form-group">
                                <label>Bathrooms</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.bathrooms ?? ''}
                                    onChange={e => setForm(f => ({ ...f, bathrooms: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Laundry</label>
                            <select
                                value={form.laundryType ?? ''}
                                onChange={e => setForm(f => ({ ...f, laundryType: e.target.value }))}
                            >
                                <option value="">Select…</option>
                                <option>In-unit</option>
                                <option>Shared in building</option>
                                <option>Laundromat</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Household</label>
                            <div className="profile-chips">
                                {HOUSEHOLD_OPTIONS.map(opt => {
                                    const selected = (form.householdMembers ?? '').split(',').map(s => s.trim()).includes(opt);
                                    return (
                                        <button
                                            key={opt}
                                            type="button"
                                            className={'ob-chip' + (selected ? ' selected' : '')}
                                            onClick={() => toggleChip(opt)}
                                        >
                                            {opt}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Cleaning style</label>
                            <select
                                value={form.cleaningStyle ?? ''}
                                onChange={e => setForm(f => ({ ...f, cleaningStyle: e.target.value }))}
                            >
                                <option value="">Select…</option>
                                <option>Pretty on top of it</option>
                                <option>Weekly sweep</option>
                                <option>As-needed</option>
                                <option>Honestly… it's chaos</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Pain points</label>
                            <textarea
                                rows={3}
                                value={form.painPoints ?? ''}
                                onChange={e => setForm(f => ({ ...f, painPoints: e.target.value }))}
                                className="profile-textarea"
                            />
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                            <button type="button" className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving…' : 'Save'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
