import { useEffect, useRef, useState } from 'react'
import { collections, type CollectionId, type Track } from './music'

const spotifyUrl = 'https://open.spotify.com/artist/5N4ZHyQxKfgmb8HnYgNFB2'
const youtubeUrl = 'https://www.youtube.com/channel/UCyh3zc-I0flxBVG5HByjz2A'
const usesNativeAudioPlayback =
  typeof navigator !== 'undefined' &&
  (/iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return '0:00'
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
}

function App() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const spectrumRef = useRef<HTMLDivElement>(null)
  const playlistRef = useRef<Track[]>([])
  const [selectedCollectionId, setSelectedCollectionId] = useState<CollectionId>('stiff-drink')
  const [playlist, setPlaylist] = useState<Track[]>([])
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [shouldPlay, setShouldPlay] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLyricsOpen, setIsLyricsOpen] = useState(false)
  const [mobileView, setMobileView] = useState<'tracks' | 'playlist'>('tracks')
  const [addNotice, setAddNotice] = useState<{ count: number; id: number } | null>(null)
  const [playbackError, setPlaybackError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const addNoticeIdRef = useRef(0)

  const selectedCollection =
    collections.find(({ id }) => id === selectedCollectionId) ?? collections[0]
  const currentCollection = currentTrack
    ? collections.find(({ tracks }) => tracks.some(({ id }) => id === currentTrack.id))
    : undefined
  const currentQueueIndex = currentTrack
    ? playlist.findIndex(({ id }) => id === currentTrack.id)
    : -1

  const prepareAudioAnalyser = () => {
    if (usesNativeAudioPlayback) return

    const audio = audioRef.current
    if (!audio) return

    try {
      if (!audioContextRef.current) {
        const context = new AudioContext()
        const analyser = context.createAnalyser()
        analyser.fftSize = 2048
        analyser.smoothingTimeConstant = 0.82

        const source = context.createMediaElementSource(audio)
        source.connect(analyser)
        analyser.connect(context.destination)

        audioContextRef.current = context
        analyserRef.current = analyser
        audioSourceRef.current = source
      }

      if (audioContextRef.current.state === 'suspended') {
        void audioContextRef.current.resume().catch((error: unknown) => {
          console.error('The audio visualizer could not resume.', error)
          setPlaybackError('Live EQ unavailable; audio playback can continue.')
        })
      }
    } catch (error) {
      console.error('The audio visualizer could not be initialized.', error)
      setPlaybackError('Live EQ unavailable; audio playback can continue.')
    }
  }

  useEffect(() => {
    const analyser = analyserRef.current
    const spectrum = spectrumRef.current
    if (!isPlaying || !analyser || !spectrum) return

    const frequencyData = new Uint8Array(analyser.frequencyBinCount)
    const binWidth = analyser.context.sampleRate / analyser.fftSize
    const displayedBinCount = Math.min(
      frequencyData.length,
      Math.ceil(7500 / binWidth),
    )
    const bars = Array.from(spectrum.children)
    let animationFrame = 0

    const updateSpectrum = () => {
      analyser.getByteFrequencyData(frequencyData)
      bars.forEach((bar, index) => {
        const start = Math.floor((index / bars.length) ** 2 * displayedBinCount)
        const end = Math.max(
          start + 1,
          Math.floor(((index + 1) / bars.length) ** 2 * displayedBinCount),
        )
        let energy = 0
        for (let bin = start; bin < end; bin += 1) {
          energy += frequencyData[bin] ** 2
        }
        const level = Math.sqrt(energy / (end - start)) / 255
        const bandPosition = index / (bars.length - 1)
        const highFrequencyBoost = 1 + 1.4 * bandPosition ** 2
        const perceivedLevel = level ** 0.72
        const height = Math.max(
          5,
          Math.round(Math.min(1, perceivedLevel * highFrequencyBoost) * 100),
        )
        bar instanceof HTMLElement && bar.style.setProperty('--bar', `${height}%`)
      })
      animationFrame = window.requestAnimationFrame(updateSpectrum)
    }

    animationFrame = window.requestAnimationFrame(updateSpectrum)
    return () => window.cancelAnimationFrame(animationFrame)
  }, [isPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack || !shouldPlay) return

    setShouldPlay(false)
    prepareAudioAnalyser()
    audio.currentTime = 0
    void audio.play().catch((error: unknown) => {
      console.error('Audio playback could not start.', error)
      setPlaybackError('Could not start playback. Try again.')
    })
  }, [currentTrack, shouldPlay])

  useEffect(() => {
    if (!addNotice) return
    const timeout = window.setTimeout(() => setAddNotice(null), 4500)
    return () => window.clearTimeout(timeout)
  }, [addNotice])

  useEffect(() => {
    if (!currentTrack?.lyrics) setIsLyricsOpen(false)
  }, [currentTrack])

  const startTrack = (track: Track) => {
    setPlaybackError(null)
    prepareAudioAnalyser()
    setCurrentTrack(track)
    setShouldPlay(true)
    setCurrentTime(0)
  }

  const addTracksToPlaylist = (tracks: Track[]) => {
    const currentPlaylist = playlistRef.current
    const knownIds = new Set(currentPlaylist.map(({ id }) => id))
    const tracksToAdd = tracks.filter(({ id }) => !knownIds.has(id))
    if (tracksToAdd.length === 0) return

    playlistRef.current = [...currentPlaylist, ...tracksToAdd]
    setPlaylist(playlistRef.current)

    setAddNotice({ count: tracksToAdd.length, id: ++addNoticeIdRef.current })
    if (currentPlaylist.length === 0) startTrack(tracksToAdd[0])
  }

  const addTrackToPlaylist = (track: Track) => addTracksToPlaylist([track])

  const playTrack = (track: Track) => {
    if (!playlistRef.current.some(({ id }) => id === track.id)) {
      addTrackToPlaylist(track)
      return
    }
    startTrack(track)
  }

  const playCollection = (collectionId: CollectionId) => {
    const collection = collections.find(({ id }) => id === collectionId)
    if (!collection) return
    setSelectedCollectionId(collectionId)
    playlistRef.current = collection.tracks
    setPlaylist(collection.tracks)
    setPlaybackError(null)
    prepareAudioAnalyser()
    setCurrentTrack(collection.tracks[0] ?? null)
    setShouldPlay(Boolean(collection.tracks[0]))
    setCurrentTime(0)
  }

  const playNext = () => {
    const nextTrack = playlist[currentQueueIndex + 1]
    if (!nextTrack) {
      audioRef.current?.pause()
      setIsPlaying(false)
      return
    }
    setPlaybackError(null)
    prepareAudioAnalyser()
    setCurrentTrack(nextTrack)
    setShouldPlay(true)
    setCurrentTime(0)
  }

  const playPrevious = () => {
    const previousTrack =
      currentTime > 3
        ? currentTrack
        : playlist[Math.max(currentQueueIndex - 1, 0)]
    if (!previousTrack) return
    setPlaybackError(null)
    setCurrentTrack(previousTrack)
    setShouldPlay(true)
    setCurrentTime(0)
  }

  const togglePlayback = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      return
    }
    if (!currentTrack && playlist[0]) {
      playTrack(playlist[0])
      return
    }
    if (!currentTrack) return
    setPlaybackError(null)
    prepareAudioAnalyser()
    void audio.play().catch((error: unknown) => {
      console.error('Audio playback could not start.', error)
      setPlaybackError('Could not start playback. Try again.')
    })
  }

  const removeTrackFromPlaylist = (track: Track, index: number) => {
    const nextPlaylist = playlistRef.current.filter((_, itemIndex) => itemIndex !== index)
    playlistRef.current = nextPlaylist
    setPlaylist(nextPlaylist)
    if (currentTrack?.id !== track.id) return

    const replacement = nextPlaylist[index] ?? nextPlaylist[index - 1] ?? null
    setCurrentTrack(replacement)
    setShouldPlay(Boolean(replacement))
    setCurrentTime(0)
    if (!replacement) {
      audioRef.current?.pause()
      setIsPlaying(false)
    }
  }

  const clearPlaylist = () => {
    audioRef.current?.pause()
    playlistRef.current = []
    setPlaylist([])
    setCurrentTrack(null)
    setShouldPlay(false)
    setIsPlaying(false)
    setCurrentTime(0)
    setPlaybackError(null)
  }

  const seekTo = (value: number) => {
    if (!audioRef.current || !Number.isFinite(duration)) return
    audioRef.current.currentTime = value
    setCurrentTime(value)
  }

  useEffect(() => {
    if (!('mediaSession' in navigator)) return

    const mediaSession = navigator.mediaSession
    mediaSession.metadata = currentTrack && typeof MediaMetadata !== 'undefined'
      ? new MediaMetadata({
          title: currentTrack.title,
          artist: 'Bear and Porch',
          album: currentCollection?.title ?? 'Bear and Porch',
          artwork: currentCollection?.artwork
            ? [{
                src: new URL(currentCollection.artwork, window.location.origin).href,
                sizes: currentCollection.id === 'stiff-drink'
                  ? '700x377'
                  : currentCollection.id === 'blue'
                    ? '295x293'
                    : '700x400',
                type: 'image/jpeg',
              }]
            : [],
        })
      : null
    mediaSession.playbackState = isPlaying
      ? 'playing'
      : currentTrack
        ? 'paused'
        : 'none'

    const audio = audioRef.current
    const actions: Array<[MediaSessionAction, MediaSessionActionHandler]> = [
      ['play', () => {
        if (!audio) return
        prepareAudioAnalyser()
        void audio.play().catch((error: unknown) => {
          console.error('Playback could not start from media controls.', error)
          setPlaybackError('Could not start playback. Try again.')
        })
      }],
      ['pause', () => audio?.pause()],
      ['nexttrack', () => {
        if (!currentTrack) return
        const tracks = playlistRef.current
        const index = tracks.findIndex(({ id }) => id === currentTrack.id)
        const nextTrack = tracks[index + 1]
        if (nextTrack) startTrack(nextTrack)
        else audio?.pause()
      }],
      ['previoustrack', () => {
        if (!currentTrack) return
        const tracks = playlistRef.current
        const index = tracks.findIndex(({ id }) => id === currentTrack.id)
        const previousTrack = audio && audio.currentTime > 3
          ? currentTrack
          : tracks[Math.max(index - 1, 0)]
        if (previousTrack) startTrack(previousTrack)
      }],
    ]

    for (const [action, handler] of actions) {
      mediaSession.setActionHandler(action, handler)
    }

    return () => {
      for (const [action] of actions) {
        mediaSession.setActionHandler(action, null)
      }
    }
  }, [currentTrack, currentCollection?.title, currentCollection?.artwork, isPlaying, playlist])

  return (
    <>
      <a className="skip-link" href="#main">Skip to player</a>
      <header className="site-header">
        <a className="wordmark" href="#main" aria-label="Bear and Porch player home">
          <span className="wordmark-mark" aria-hidden="true">B/P</span>
          <span>BEAR <span className="wordmark-and">&</span> PORCH</span>
        </a>
        <div className="header-center">ARTIST <span>◆</span> BEAR AND PORCH</div>
        <div className="header-links">
          <a href={spotifyUrl} target="_blank" rel="noreferrer">SPOTIFY ↗</a>
          <a href={youtubeUrl} target="_blank" rel="noreferrer">YOUTUBE ↗</a>
        </div>
      </header>

      <main className="player-shell" id="main">
        <div className="window-titlebar">
          <div className="window-title">
            <span className="window-led" />
            BEAR AND PORCH MEDIA PLAYER
            <span className="window-edition">CLASSIC SKIN / 01</span>
          </div>
          <div className="window-controls" aria-hidden="true"><span>_</span><span>□</span><span>×</span></div>
        </div>

        <div className="transport-readout">
          <div className="readout-track">
            <span className="readout-label">NOW PLAYING</span>
            <strong>{currentTrack?.title ?? 'Select a track from the library'}</strong>
            <span>{currentCollection?.title ?? 'BEAR AND PORCH'}</span>
          </div>
          <div
            className={`spectrum${isPlaying ? ' is-playing' : ''}${usesNativeAudioPlayback ? ' spectrum-native' : ''}`}
            ref={spectrumRef}
            role="img"
            aria-label={usesNativeAudioPlayback ? 'Audio visualizer' : 'Live audio frequency visualizer'}
          >
            {Array.from({ length: 64 }, (_, index) => <i key={index} />)}
          </div>
          <div className="readout-clock">{formatTime(currentTime)} <span>/</span> {formatTime(duration)}</div>
        </div>

        <div className={`workspace mobile-view-${mobileView}`}>
          <aside className="library-panel" aria-label="Music library">
            <div className="panel-heading">
              <span>LIBRARY</span>
              <span className="panel-count">01 ARTIST</span>
            </div>
            <button className="artist-selection" type="button" aria-pressed="true">
              <span className="artist-avatar" aria-hidden="true">B<span>&</span>P</span>
              <span className="artist-copy"><strong>Bear and Porch</strong><small>{collections.length} collections</small></span>
            </button>
            <div className="collection-heading">
              <span>COLLECTIONS</span>
              <span className="collection-count">{String(collections.length).padStart(2, '0')}</span>
              <span className="collection-swipe-hint" aria-hidden="true">SWIPE TO EXPLORE <span>→</span></span>
            </div>
            <div className="collection-rail">
              <nav className="collection-nav" aria-label="Bear and Porch collections">
                {collections.map((collection) => (
                  <button
                    className={`collection-option${selectedCollectionId === collection.id ? ' is-selected' : ''}`}
                    type="button"
                    key={collection.id}
                    aria-pressed={selectedCollectionId === collection.id}
                    onClick={() => setSelectedCollectionId(collection.id)}
                  >
                    <span className="collection-glyph" aria-hidden="true">{collection.id === 'workshop' ? '✳' : '▤'}</span>
                    <span className="collection-copy"><strong>{collection.title}</strong><small>{String(collection.tracks.length).padStart(2, '0')} tracks</small></span>
                  </button>
                ))}
              </nav>
            </div>
            <div className="library-footer">
              <span className="tiny-led" />
              <span>LOCAL COLLECTION</span>
            </div>
          </aside>

          <section className="browse-panel" aria-labelledby="collection-title">
            <div className="panel-heading">
              <span>ARTIST / BEAR AND PORCH</span>
              <span className="panel-count">LIBRARY VIEW</span>
            </div>
            <div className="collection-hero">
              <div className={`collection-cover collection-cover-${selectedCollection.id}`}>
                {selectedCollection.artwork
                  ? <img src={selectedCollection.artwork} alt="" />
                  : <span aria-hidden="true">B/P<br /><small>WORKSHOP TAPES</small></span>}
                <span className="cover-shine" />
              </div>
              <div className="collection-intro">
                <span className="readout-label">SELECTED COLLECTION</span>
                <h1 id="collection-title">{selectedCollection.title}</h1>
                <p>{selectedCollection.description}</p>
                <span className="collection-meta">{selectedCollection.tracks.length} TRACKS <span>·</span> BEAR AND PORCH</span>
              </div>
            </div>
            <div className="mobile-view-heading" aria-live="polite">
              <span>{mobileView === 'tracks' ? 'TRACKS IN THIS COLLECTION' : 'YOUR PLAYLIST'}</span>
              <span>{mobileView === 'tracks' ? selectedCollection.tracks.length : playlist.length}</span>
            </div>
            <div className="mobile-view-switcher" role="group" aria-label="Choose tracks or playlist">
              <button
                type="button"
                className={mobileView === 'tracks' ? 'is-active' : ''}
                aria-pressed={mobileView === 'tracks'}
                onClick={() => setMobileView('tracks')}
              >
                TRACKS <span>{selectedCollection.tracks.length}</span>
              </button>
              <button
                type="button"
                className={mobileView === 'playlist' ? 'is-active' : ''}
                aria-pressed={mobileView === 'playlist'}
                onClick={() => setMobileView('playlist')}
              >
                PLAYLIST <span>{playlist.length}</span>
              </button>
            </div>
            <div className="collection-toolbar">
              <button className="play-all-button" type="button" onClick={() => playCollection(selectedCollection.id)}>
                <span aria-hidden="true">▶</span> PLAY COLLECTION
              </button>
              <button className="subtle-button" type="button" onClick={() => addTracksToPlaylist(selectedCollection.tracks)}>
                <span aria-hidden="true">＋</span> ADD ALL TO PLAYLIST
              </button>
              <span className="toolbar-spacer" />
              <span className="track-total">{String(selectedCollection.tracks.length).padStart(2, '0')} ITEMS</span>
            </div>
            <div className="track-table">
              <div className="track-table-header" aria-hidden="true">
                <span>#</span>
                <span>TITLE</span>
                <span>LYRICS</span>
                <span>ADD</span>
              </div>
              <ol className="library-track-list" aria-label={`${selectedCollection.title} tracks`}>
                {selectedCollection.tracks.map((track, index) => {
                  const isCurrent = currentTrack?.id === track.id
                  const isQueued = playlist.some(({ id }) => id === track.id)
                  return (
                    <li className={`library-track${isCurrent ? ' is-current' : ''}`} key={track.id}>
                      <span className="library-track-number">{isCurrent && isPlaying ? '♫' : String(index + 1).padStart(2, '0')}</span>
                      <button className="library-track-title" type="button" onClick={() => addTrackToPlaylist(track)}>
                        <strong>{track.title}</strong>
                        <small>{isCurrent ? 'NOW PLAYING' : 'BEAR AND PORCH'}</small>
                      </button>
                      {track.lyrics
                        ? <span className="has-lyrics" title="Lyrics available">LYRICS</span>
                        : <span className="no-lyrics">—</span>}
                      <button
                        className="add-track-button"
                        type="button"
                        onClick={() => addTrackToPlaylist(track)}
                        disabled={isQueued}
                        aria-label={`${isQueued ? 'Already in playlist' : 'Add'} ${track.title}${isQueued ? '' : ' to playlist'}`}
                      >{isQueued ? '✓' : '+'}</button>
                    </li>
                  )
                })}
              </ol>
            </div>
          </section>

          <aside className="playlist-panel" aria-label="Playlist">
            <div className="panel-heading">
              <span>PLAYLIST</span>
              <span className="panel-count">{String(playlist.length).padStart(2, '0')} TRACKS</span>
            </div>
            <div className="playlist-toolbar">
              <span>UNTITLED MIX</span>
              <button className="text-button" type="button" onClick={clearPlaylist} disabled={playlist.length === 0}>CLEAR</button>
            </div>
            {playlist.length === 0 ? (
              <div className="empty-playlist">
                <span className="empty-playlist-icon" aria-hidden="true">＋</span>
                <strong>Your playlist is empty</strong>
                <p>Select a collection, then add a track or the whole record.</p>
              </div>
            ) : (
              <ol className="queue-list">
                {playlist.map((track, index) => {
                  const collection = collections.find(({ tracks }) => tracks.some(({ id }) => id === track.id))
                  const isCurrent = currentTrack?.id === track.id
                  return (
                    <li className={`queue-track${isCurrent ? ' is-current' : ''}`} key={`${track.id}-${index}`}>
                      <button className="queue-play" type="button" onClick={() => playTrack(track)} aria-label={`Play ${track.title}`}>
                        <span aria-hidden="true">{isCurrent && isPlaying ? '♫' : String(index + 1).padStart(2, '0')}</span>
                      </button>
                      <button className="queue-track-copy" type="button" onClick={() => playTrack(track)}>
                        <strong>{track.title}</strong>
                        <small>{collection?.title ?? 'Bear and Porch'}</small>
                      </button>
                      <button className="queue-remove" type="button" onClick={() => removeTrackFromPlaylist(track, index)} aria-label={`Remove ${track.title} from playlist`}>×</button>
                    </li>
                  )
                })}
              </ol>
            )}
            <div className="playlist-footer">
              <span>{playlist.length ? `${playlist.length} tracks queued` : 'Nothing queued yet'}</span>
              <span>↕</span>
            </div>
          </aside>
        </div>
        <div className="window-statusbar">
          <span><i className="tiny-led" /> {playbackError ?? (isPlaying ? 'PLAYING' : 'READY')}</span>
          <span>BEAR AND PORCH · LOCAL AUDIO</span>
          <span>{playlist.length} IN PLAYLIST</span>
        </div>
      </main>

      {addNotice && (
        <div className="playlist-add-notice" role="status">
          <span>{addNotice.count === 1 ? 'Added to playlist' : `Added ${addNotice.count} tracks to playlist`}</span>
          <button
            type="button"
            onClick={() => {
              setMobileView('playlist')
              setAddNotice(null)
            }}
          >
            VIEW PLAYLIST
          </button>
          <button
            className="notice-dismiss"
            type="button"
            aria-label="Dismiss playlist notification"
            onClick={() => setAddNotice(null)}
          >
            ×
          </button>
        </div>
      )}

      <aside
        className={`lyrics-drawer${isLyricsOpen ? ' is-open' : ''}`}
        id="lyrics-panel"
        aria-label="Current track lyrics"
        aria-hidden={!isLyricsOpen}
      >
        <div className="lyrics-drawer-heading">
          <div><span className="readout-label">NOW PLAYING · LYRICS</span><strong>{currentTrack?.title ?? 'No track selected'}</strong></div>
          <button type="button" onClick={() => setIsLyricsOpen(false)} aria-label="Close lyrics">×</button>
        </div>
        {currentTrack?.lyrics
          ? <p className="lyrics-drawer-text">{currentTrack.lyrics}</p>
          : <p className="lyrics-empty">Lyrics aren’t available for this track.</p>}
      </aside>

      <footer className="player-dock" aria-label="Audio player">
        <audio
          ref={audioRef}
          preload="none"
          src={currentTrack?.src}
          onEnded={playNext}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onDurationChange={(event) => setDuration(event.currentTarget.duration)}
          aria-label={currentTrack ? `Audio for ${currentTrack.title}` : 'Bear and Porch audio'}
        />
        <div className="dock-track">
          <span className={`dock-disc${isPlaying ? ' is-playing' : ''}`} aria-hidden="true">B/P</span>
          <div><small>{currentCollection?.title ?? 'BEAR AND PORCH'}</small><strong>{currentTrack?.title ?? 'Ready when you are'}</strong></div>
        </div>
        <div className="dock-center">
          <div className="dock-controls">
            <button type="button" className="dock-control" onClick={playPrevious} disabled={!currentTrack} aria-label="Previous track">
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M16 4v12L7 10z" />
                <path d="M3 4h2v12H3z" />
              </svg>
            </button>
            <button type="button" className="dock-play" onClick={togglePlayback} disabled={!currentTrack && playlist.length === 0} aria-label={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? (
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <rect x="4" y="3" width="3" height="10" rx="0.5" />
                  <rect x="9" y="3" width="3" height="10" rx="0.5" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M5 3.5 13 8l-8 4.5z" />
                </svg>
              )}
            </button>
            <button type="button" className="dock-control" onClick={playNext} disabled={!currentTrack} aria-label="Next track">
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M4 4v12l9-6z" />
                <path d="M15 4h2v12h-2z" />
              </svg>
            </button>
            <button
              type="button"
              className={`dock-control dock-lyrics${isLyricsOpen ? ' is-active' : ''}`}
              onClick={() => setIsLyricsOpen((open) => !open)}
              disabled={!currentTrack?.lyrics}
              aria-label={isLyricsOpen ? 'Close lyrics' : 'View lyrics'}
              aria-pressed={isLyricsOpen}
              aria-expanded={isLyricsOpen}
              aria-controls="lyrics-panel"
              title={currentTrack?.lyrics ? (isLyricsOpen ? 'Close lyrics' : 'View lyrics') : 'Lyrics unavailable'}
            >
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M4 5h12M4 10h12M4 15h8" />
              </svg>
              <span>LYRICS</span>
            </button>
          </div>
          <div className="seek-row">
            <span>{formatTime(currentTime)}</span>
            <input
              aria-label="Seek"
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={Math.min(currentTime, duration || 0)}
              onChange={(event) => seekTo(Number(event.currentTarget.value))}
              disabled={!currentTrack || !duration}
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <div className="dock-right">
          <span className="dock-format">{currentTrack ? 'MP3 · LOCAL' : 'PLAYER IDLE'}</span>
        </div>
      </footer>
    </>
  )
}

export default App
