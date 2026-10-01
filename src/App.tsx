import { useEffect, useRef, useState } from 'react'
import { collections, findCollection, type CollectionId, type Track } from './music'

const spotifyUrl = 'https://open.spotify.com/artist/5N4ZHyQxKfgmb8HnYgNFB2'
const youtubeUrl = 'https://www.youtube.com/channel/UCyh3zc-I0flxBVG5HByjz2A'

function App() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [activeTrack, setActiveTrack] = useState<Track | null>(null)
  const [shouldPlay, setShouldPlay] = useState(false)
  const [playbackError, setPlaybackError] = useState<string | null>(null)

  const collection = activeTrack
    ? collections.find(({ tracks }) => tracks.some(({ id }) => id === activeTrack.id))
    : undefined
  const trackIndex = collection?.tracks.findIndex(({ id }) => id === activeTrack?.id) ?? -1

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !activeTrack || !shouldPlay) return

    setShouldPlay(false)
    void audio.play().catch((error: unknown) => {
      console.error('Audio playback could not start.', error)
      setPlaybackError('Playback did not start. Press play in the player to try again.')
    })
  }, [activeTrack, shouldPlay])

  const playTrack = (track: Track) => {
    setPlaybackError(null)
    setActiveTrack(track)
    setShouldPlay(true)
  }

  const playAdjacentTrack = (direction: -1 | 1) => {
    if (!collection || trackIndex < 0) return
    const nextIndex = (trackIndex + direction + collection.tracks.length) % collection.tracks.length
    playTrack(collection.tracks[nextIndex])
  }

  const handleTrackEnded = () => playAdjacentTrack(1)

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Bear and Porch home">
          <span className="wordmark-mark" aria-hidden="true">B/P</span>
          <span>BEAR <span className="wordmark-and">&</span> PORCH</span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#albums">Albums</a>
          <a href="#workshop">Workshop</a>
        </nav>
        <div className="header-links">
          <a href={spotifyUrl} target="_blank" rel="noreferrer">Spotify <span aria-hidden="true">↗</span></a>
          <a href={youtubeUrl} target="_blank" rel="noreferrer">YouTube <span aria-hidden="true">↗</span></a>
        </div>
      </header>

      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-dot" /> INDEPENDENT SONGS · TEXAS ROOTS</p>
            <h1 id="hero-title">Stay a little.<br /><span>Leave a little louder.</span></h1>
            <div className="hero-bottom">
              <p>Two records and a room full of works in progress.<br className="desktop-break" /> Find a track, settle in, and make yourself at home.</p>
              <a className="circle-link" href="#albums" aria-label="Explore the music">
                <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <div className="hero-sun" />
            <div className="hero-record">
              <div className="record-grooves" />
              <div className="record-label">B<span>&</span>P</div>
            </div>
            <div className="hero-sticker">PLAY<br />SOMETHING<br />GOOD</div>
            <span className="hero-coordinate">30° 16' N&nbsp; / &nbsp;97° 44' W</span>
          </div>
          <div className="hero-index"><span>01</span> / 03 <span className="index-line" /> THE CATALOG</div>
        </section>

        <section className="catalog section-wrap" id="albums" aria-labelledby="albums-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE RECORDS <span className="eyebrow-rule" /></p>
              <h2 id="albums-title">Albums<span className="heading-period">.</span></h2>
            </div>
            <p className="section-aside">Listen front to back,<br />or find a favorite.</p>
          </div>
          <div className="album-grid">
            {collections.filter(({ id }) => id !== 'workshop').map((album, index) => (
              <article className="album-card" key={album.id}>
                <div className={`album-art album-art-${index + 1}`}>
                  <img src={album.artwork} alt={`${album.title} album artwork`} />
                  <button
                    className="album-play"
                    type="button"
                    onClick={() => playTrack(album.tracks[0])}
                    aria-label={`Play ${album.title} from the beginning`}
                  >
                    <span aria-hidden="true">▶</span>
                  </button>
                </div>
                <div className="album-info">
                  <div className="album-title-row">
                    <div>
                      <h3>{album.title}</h3>
                      <p>{album.description}</p>
                    </div>
                    <span className="track-count">{String(album.tracks.length).padStart(2, '0')} TRACKS</span>
                  </div>
                  <TrackList
                    collectionId={album.id}
                    tracks={album.tracks}
                    activeTrack={activeTrack}
                    onPlay={playTrack}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="workshop section-wrap" id="workshop" aria-labelledby="workshop-title">
          <div className="workshop-intro">
            <p className="eyebrow">OUTSIDE THE LINES <span className="eyebrow-rule" /></p>
            <h2 id="workshop-title">The<br />Workshop<span className="heading-period">.</span></h2>
            <p className="workshop-description">Demos, detours, and songs that are still figuring out what they want to be. Nothing polished up for company.</p>
            <div className="workshop-note">
              <span className="note-mark" aria-hidden="true">✳</span>
              <span>A living room for the in-between.</span>
            </div>
          </div>
          <div className="workshop-list-wrap">
            <div className="workshop-list-heading">
              <span>FROM THE NOTEBOOK</span>
              <span>{String(findCollection('workshop').tracks.length).padStart(2, '0')} CUTS</span>
            </div>
            <TrackList
              collectionId="workshop"
              tracks={findCollection('workshop').tracks}
              activeTrack={activeTrack}
              onPlay={playTrack}
            />
          </div>
        </section>

        <section className="outro section-wrap" aria-label="Find Bear and Porch elsewhere">
          <p>Take the long way.</p>
          <div className="outro-links">
            <a href={spotifyUrl} target="_blank" rel="noreferrer">Find us on Spotify <span aria-hidden="true">↗</span></a>
            <a href={youtubeUrl} target="_blank" rel="noreferrer">Watch on YouTube <span aria-hidden="true">↗</span></a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="footer-wordmark" href="#top">BEAR <span>&</span> PORCH</a>
        <span>© {new Date().getFullYear()} Bear and Porch</span>
        <a href="#top" className="back-top">BACK TO TOP ↑</a>
      </footer>

      <aside className="player-dock" aria-label="Music player">
        <div className="player-track">
          <span className={`playing-indicator${activeTrack ? ' is-active' : ''}`} aria-hidden="true">
            <i /><i /><i />
          </span>
          <div className="player-track-copy" aria-live="polite">
            <span className="player-label">{collection?.title ?? 'BEAR AND PORCH'}</span>
            <span className="player-title">{activeTrack?.title ?? 'Pick a track to begin'}</span>
          </div>
        </div>
        <div className="player-controls">
          <button
            type="button"
            className="skip-button"
            disabled={!activeTrack}
            aria-label="Previous track"
            onClick={() => playAdjacentTrack(-1)}
          >|◀</button>
          <audio
            ref={audioRef}
            controls
            preload="none"
            src={activeTrack?.src}
            onEnded={handleTrackEnded}
            aria-label={activeTrack ? `Play ${activeTrack.title}` : 'Audio playback controls'}
          />
          <button
            type="button"
            className="skip-button"
            disabled={!activeTrack}
            aria-label="Next track"
            onClick={() => playAdjacentTrack(1)}
          >▶|</button>
        </div>
        <div className="player-status">
          <span className="player-status-dot" />
          <span>{playbackError ?? 'NOW PLAYING'}</span>
        </div>
      </aside>
    </>
  )
}

interface TrackListProps {
  collectionId: CollectionId
  tracks: Track[]
  activeTrack: Track | null
  onPlay: (track: Track) => void
}

function TrackList({ collectionId, tracks, activeTrack, onPlay }: TrackListProps) {
  return (
    <ol className={`track-list${collectionId === 'workshop' ? ' track-list-workshop' : ''}`}>
      {tracks.map((track, index) => {
        const isActive = activeTrack?.id === track.id
        return (
          <li className={`track-row${isActive ? ' is-current' : ''}`} key={track.id}>
            <button
              className="track-button"
              type="button"
              onClick={() => onPlay(track)}
              aria-pressed={isActive}
              aria-label={`${isActive ? 'Selected' : 'Play'} ${track.title}`}
            >
              <span className="track-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="track-title">{track.title}</span>
              <span className="track-action" aria-hidden="true">{isActive ? '♫' : '＋'}</span>
            </button>
            {track.lyrics && (
              <details className="track-lyrics">
                <summary>Read lyrics</summary>
                <p className="track-lyrics-text">{track.lyrics}</p>
              </details>
            )}
          </li>
        )
      })}
    </ol>
  )
}

export default App
