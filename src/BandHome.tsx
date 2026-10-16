import { collections, type CollectionId, type MusicCollection, type Track } from './music'

interface BandHomeProps {
  currentTrack: Track | null
  isPlaying: boolean
  onPlayCollection: (id: CollectionId) => void
  onPlayTrack: (collection: MusicCollection, track: Track) => void
  spotifyUrl: string
  youtubeUrl: string
}

export default function BandHome({
  currentTrack,
  isPlaying,
  onPlayCollection,
  onPlayTrack,
  spotifyUrl,
  youtubeUrl,
}: BandHomeProps) {
  return (
    <>
      <a className="skip-link" href="#music">Skip to music</a>
      <header className="band-header">
        <a className="band-wordmark" href="/" aria-label="Bear and Porch home">BEAR <span>&</span> PORCH</a>
        <nav aria-label="Main navigation">
          <a className="bear-play-nav" href="/winamp/">Bear Play <span aria-hidden="true">&rarr;</span></a>
        </nav>
      </header>

      <main id="music">
        <section className="band-intro" aria-labelledby="band-title">
          <p className="band-eyebrow">RECORDS / ROUGH CUTS / EVERYTHING IN BETWEEN</p>
          <h1 id="band-title">Bear and Porch<span>Pull up a chair. Put on a record.</span></h1>
          <p>A few records, some unfinished corners, and songs that found their own way.</p>
          <div className="bear-play-invitation">
            <a className="bear-play-cta" href="/winamp/">
              <span className="bear-play-icon" aria-hidden="true">&#9654;</span>
              <span>Open Bear Play<small>Our classic music player</small></span>
              <span aria-hidden="true">&rarr;</span>
            </a>
            <p>All the music. Your own playlist. A little nostalgia.</p>
          </div>
          <div className="band-socials">
            <a href={spotifyUrl} target="_blank" rel="noreferrer">Listen on Spotify <span aria-hidden="true">&#8599;</span></a>
            <a href={youtubeUrl} target="_blank" rel="noreferrer">Watch on YouTube <span aria-hidden="true">&#8599;</span></a>
          </div>
        </section>

        <div className="discography-heading">
          <h2>The music</h2>
          <span>{String(collections.length).padStart(2, '0')} COLLECTIONS</span>
        </div>
        <nav className="album-index" aria-label="Jump to an album">
          {collections.map((collection) => (
            <a key={collection.id} href={`#${collection.id}`}>{collection.title}</a>
          ))}
        </nav>

        <div className="band-albums">
          {collections.map((collection, albumIndex) => (
            <section className="band-album" id={collection.id} key={collection.id} aria-labelledby={`${collection.id}-title`}>
              <div className="album-art">
                {collection.artwork && <img src={collection.artwork} alt={`${collection.title} cover artwork`} loading={albumIndex === 0 ? 'eager' : 'lazy'} />}
                <div className="album-art-caption"><span>BEAR AND PORCH</span><span>{String(albumIndex + 1).padStart(2, '0')}</span></div>
              </div>
              <div className="album-details">
                <p className="band-eyebrow">{collection.tracks.length} TRACKS / {collection.id === 'workshop' ? 'FROM THE WORKSHOP' : 'BEAR AND PORCH'}</p>
                <h2 id={`${collection.id}-title`}>{collection.title}</h2>
                <p className="album-description">{collection.description}</p>
                <button className="album-play" type="button" onClick={() => onPlayCollection(collection.id)} aria-label={`Play ${collection.title}`}>
                  <span aria-hidden="true">&#9654;</span> Play collection
                </button>
                <ol className="album-tracks" aria-label={`${collection.title} tracks`}>
                  {collection.tracks.map((track, index) => {
                    const isCurrent = currentTrack?.id === track.id
                    const playing = isCurrent && isPlaying
                    return (
                      <li key={track.id} className={isCurrent ? 'is-current' : undefined}>
                        <button type="button" onClick={() => onPlayTrack(collection, track)} aria-label={`${playing ? 'Pause' : 'Play'} ${track.title}`} aria-current={isCurrent ? 'true' : undefined}>
                          <span className="album-track-number">{String(index + 1).padStart(2, '0')}</span>
                          <span className="album-track-icon" aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span>
                          <span className="album-track-title">{track.title}</span>
                          {isCurrent && <span className="album-track-status">{playing ? 'PLAYING' : 'PAUSED'}</span>}
                        </button>
                      </li>
                    )
                  })}
                </ol>
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="band-footer">
        <a className="band-wordmark" href="/">BEAR <span>&</span> PORCH</a>
        <p>Thanks for listening.</p>
        <a href="/winamp/">Feeling nostalgic? Open Bear Play <span aria-hidden="true">&rarr;</span></a>
      </footer>
    </>
  )
}
