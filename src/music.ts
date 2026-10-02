import { lyricsByTrackId } from './lyrics'

export type CollectionId = 'stiff-drink' | 'great-escape' | 'blue' | 'workshop'

export interface Track {
  id: string
  title: string
  src: string
  lyrics?: string
}

export interface MusicCollection {
  id: CollectionId
  title: string
  description: string
  artwork?: string
  tracks: Track[]
}

const makeTrack = (
  collection: CollectionId,
  id: string,
  title: string,
  file: string,
): Track => {
  const trackId = `${collection}:${id}`

  return {
    id: trackId,
    title,
    src: `/media/${collection}/${file}`,
    lyrics: lyricsByTrackId[trackId],
  }
}

export const collections: MusicCollection[] = [
  {
    id: 'stiff-drink',
    title: 'Stiff Drink',
    description: 'The first record. Thirteen songs, no hurry.',
    artwork: '/media/artwork/stiff-drink.jpg',
    tracks: [
      makeTrack('stiff-drink', 'had-a-fight', 'Had a Fight', '01-had-a-fight.mp3'),
      makeTrack('stiff-drink', 'i-need-a-stiff-drink', 'I Need a Stiff Drink', '02-i-need-a-stiff-drink.mp3'),
      makeTrack('stiff-drink', 'red-cup', 'Red Cup', '03-red-cup.mp3'),
      makeTrack('stiff-drink', 'sometimes-i-feel-so-sad', 'Sometimes I Feel So Sad', '04-sometimes-i-feel-so-sad.mp3'),
      makeTrack('stiff-drink', 'hit-the-wall', 'Hit the Wall', '05-hit-the-wall.mp3'),
      makeTrack('stiff-drink', 'im-not-sorry', "I'm Not Sorry", '06-im-not-sorry.mp3'),
      makeTrack('stiff-drink', 'vacation-days', 'Vacation Days', '07-vacation-days.mp3'),
      makeTrack('stiff-drink', 'went-home-with-a-ten', 'Went Home with a Ten', '08-went-home-with-a-ten.mp3'),
      makeTrack('stiff-drink', 'i-cant-live-with-you-anymore', "I Can't Live with You Anymore", '09-i-cant-live-with-you-anymore.mp3'),
      makeTrack('stiff-drink', 'grandfather-man', 'Grandfather Man', '10-grandfather-man.mp3'),
      makeTrack('stiff-drink', 'ascention', 'Ascention', '11-ascention.mp3'),
      makeTrack('stiff-drink', 'waiting-for-you', 'Waiting for You', '12-waiting-for-you.mp3'),
      makeTrack('stiff-drink', 'if-youre-not-careful', "If You're Not Careful", '13-if-youre-not-careful.mp3'),
    ],
  },
  {
    id: 'great-escape',
    title: 'The Great Escape',
    description: 'A road record about getting out and getting home.',
    artwork: '/media/artwork/great-escape.jpg',
    tracks: [
      makeTrack('great-escape', 'the-great-escape', 'The Great Escape', '01-the-great-escape.mp3'),
      makeTrack('great-escape', 'hitting-the-road', 'Hitting the Road', '02-hitting-the-road.mp3'),
      makeTrack('great-escape', 'we-were-kids', 'We Were Kids', '03-we-were-kids.mp3'),
      makeTrack('great-escape', 'wasting-away', 'Wasting Away', '04-wasting-away.mp3'),
      makeTrack('great-escape', 'forbidden-fiddle', 'Forbidden Fiddle', '05-forbidden-fiddle.mp3'),
      makeTrack('great-escape', 'washington-street', 'Washington Street', '06-washington-street.mp3'),
      makeTrack('great-escape', 'different-light', 'Different Light', '07-different-light.mp3'),
      makeTrack('great-escape', 'taylas-song', "Tayla's Song", '08-taylas-song.mp3'),
      makeTrack('great-escape', 'devils-town', "Devil's Town", '09-devils-town.mp3'),
      makeTrack('great-escape', 'biscuits-and-gravy', 'Biscuits and Gravy', '10-biscuits-and-gravy.mp3'),
      makeTrack('great-escape', 'whats-the-choice', "What's the Choice", '11-whats-the-choice.mp3'),
      makeTrack('great-escape', 'i-got-no-home', 'I Got No Home', '12-i-got-no-home.mp3'),
      makeTrack('great-escape', 'fifty-pounds', 'Fifty Pounds', '13-fifty-pounds.mp3'),
      makeTrack('great-escape', 'coming-home', 'Coming Home', '14-coming-home.mp3'),
      makeTrack('great-escape', 'sunsets-and-prisons', 'Sunsets and Prisons', '15-sunsets-and-prisons.mp3'),
    ],
  },
  {
    id: 'blue',
    title: 'Project Blue',
    description: 'Three rough-cut songs, altogether different from the other projects.',
    artwork: '/media/artwork/project-blue.jpg',
    tracks: [
      makeTrack('blue', 'bimini-road', 'Bimini Road', 'bimini-road.mp3'),
      makeTrack('blue', 'track-2', 'Track 2', 'track-2.mp3'),
      makeTrack('blue', 'track-3', 'Track 3', 'track-3.mp3'),
    ],
  },
  {
    id: 'workshop',
    title: 'Workshop',
    description: 'Unfinished corners, odd ideas, and songs that found their own way.',
    artwork: '/media/artwork/workshop.jpg',
    tracks: [
      makeTrack('workshop', 'forbidden-fiddle', 'Forbidden Fiddle', 'forbidden-fiddle.mp3'),
      makeTrack('workshop', 'roll-those-bones', 'Roll Those Bones', 'roll-those-bones.mp3'),
      makeTrack('workshop', 'let-it-go', 'Let It Go', 'let-it-go.mp3'),
      makeTrack('workshop', 'get-on-home', 'Get On Home', 'get-on-home.mp3'),
      makeTrack('workshop', 'drunken-lullaby', 'Drunken Lullaby', 'drunken-lullaby.mp3'),
      makeTrack('workshop', 'instrumental', 'Instrumental', 'instrumental.mp3'),
      makeTrack('workshop', 'have-ourselves-a-time', 'Have Ourselves a Time', 'have-ourselves-a-time.mp3'),
      makeTrack('workshop', 'running-away', 'Running Away', 'running-away.mp3'),
      makeTrack('workshop', 'svedka-song', 'Svedka Song', 'svedka-song.mp3'),
      makeTrack('workshop', 'no-love', 'No Love', 'no-love.mp3'),
      makeTrack('workshop', 'good-riddance', 'Good Riddance', 'good-riddance.mp3'),
      makeTrack('workshop', 'i-told-you-baby', 'I Told You Baby', 'i-told-you-baby.mp3'),
      makeTrack('workshop', 'get-burned', 'Get Burned', 'get-burned.mp3'),
      makeTrack('workshop', 'orphan-girl', 'Orphan Girl (Gillian Welch cover)', 'orphan-girl.mp3'),
    ],
  },
]

export const findCollection = (id: CollectionId) =>
  collections.find((collection) => collection.id === id)!
