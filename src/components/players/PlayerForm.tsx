import { useState, useRef, useCallback } from 'react';
import type { PlayerRole } from '../../types';
import { useApp } from '../../context/AppContext';
import { StarRating } from '../ui/StarRating';
import { Button } from '../ui/Button';

interface PlayerFormProps {
  editData?: {
    name: string;
    photo: string | null;
    level: number;
    role: PlayerRole;
  } | null;
  onClearEdit?: () => void;
}

export function PlayerForm({ editData, onClearEdit }: PlayerFormProps) {
  const { dispatch } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(editData?.name ?? '');
  const [photoUrl, setPhotoUrl] = useState(
    editData?.photo && !editData.photo.startsWith('data:') ? editData.photo : ''
  );
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    editData?.photo?.startsWith('data:') ? editData.photo : null
  );
  const [level, setLevel] = useState(editData?.level ?? 3);
  const [role, setRole] = useState<PlayerRole>(editData?.role ?? 'Milieu');

  const resetForm = useCallback(() => {
    setName('');
    setPhotoUrl('');
    setPhotoPreview(null);
    setLevel(3);
    setRole('Milieu');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClearEdit?.();
  }, [onClearEdit]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Veuillez entrer un nom de joueur');
      return;
    }

    const resolvePhoto = (): string | null => {
      if (photoPreview) return photoPreview;
      if (photoUrl.trim()) return photoUrl.trim();
      return null;
    };

    if (fileInputRef.current?.files?.[0] && !photoPreview) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        dispatch({
          type: 'ADD_PLAYER',
          payload: { name: name.trim(), photo: ev.target?.result as string, level, role },
        });
        resetForm();
      };
      reader.readAsDataURL(fileInputRef.current.files[0]);
    } else {
      dispatch({
        type: 'ADD_PLAYER',
        payload: { name: name.trim(), photo: resolvePhoto(), level, role },
      });
      resetForm();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="player-form">
      <h2 style={{ color: '#4ade80', marginBottom: 12, fontSize: 16 }}>
        {editData ? 'Modifier un Joueur' : 'Ajouter un Joueur'}
      </h2>

      <div className="form-row full">
        <div className="form-group">
          <label>Nom</label>
          <input
            type="text"
            placeholder="Nom du joueur"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyPress}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Photo</label>
          <div className="photo-input-group">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ flex: 1 }}
              onChange={handleFileChange}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setPhotoPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              Effacer
            </Button>
          </div>
          <div className="photo-preview-container">
            {photoPreview && (
              <img src={photoPreview} className="photo-preview" alt="Aperçu" />
            )}
            <input
              type="text"
              placeholder="Ou URL d'image"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Position</label>
          <select value={role} onChange={(e) => setRole(e.target.value as PlayerRole)}>
            <option value="">Sans position</option>
            <option value="Gardien">Gardien</option>
            <option value="Défenseur">Défenseur</option>
            <option value="Milieu">Milieu</option>
            <option value="Attaquant">Attaquant</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Niveau de Compétence (1-5)</label>
        <StarRating value={level} onChange={setLevel} />
      </div>

      <Button variant="primary" style={{ width: '100%' }} onClick={handleSubmit}>
        {editData ? 'Modifier Joueur' : 'Ajouter Joueur'}
      </Button>
      {editData && (
        <Button variant="secondary" style={{ width: '100%', marginTop: 8 }} onClick={resetForm}>
          Annuler
        </Button>
      )}
    </div>
  );
}
