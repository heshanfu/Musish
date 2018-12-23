import _shuffle from 'lodash.shuffle';
import { createMediaItem } from '../utils/Utils';

let originalQueue = null;

export async function playSong(songs, index) {
  const music = MusicKit.getInstance();
  await setQueueItems(songs, index);
  await music.player.play();
}

export async function playAlbum(album, index) {
  const music = MusicKit.getInstance();
  await setQueueItems(album.relationships.tracks.data, index);
  await music.player.play();
}
export async function playPlaylist(playlist, index) {
  const music = MusicKit.getInstance();
  await setQueueItems(playlist.relationships.tracks.data, index);
  await music.player.play();
}

export async function playNext(song) {
  await MusicKit.getInstance().player.queue.prepend({
    items: [createMediaItem(song)],
  });
}

export async function playLater(song) {
  await MusicKit.getInstance().player.queue.append({ items: [createMediaItem(song)] });
}

export async function play() {
  await MusicKit.getInstance().player.play();
}
export async function pause() {
  await MusicKit.getInstance().player.pause();
}

export async function seekToTime(time) {
  await MusicKit.getInstance().player.seekToTime(time);
}

export function getPlayingItem() {
  return MusicKit.getInstance().player.nowPlayingItem;
}

function getPosition(items, item) {
  return items.reduce((index, currentItem, i) => {
    if (isSame(currentItem, item)) {
      return i;
    }

    return index;
  }, 0);
}

export async function shuffle() {
  const currentQueue = getQueueItems();
  if (!isShuffled()) {
    originalQueue = [...currentQueue];
  }

  const newQueue = _shuffle(currentQueue);
  const newPosition = getPosition(newQueue, getPlayingItem());
  await setQueueItems(newQueue, newPosition);
}

export async function unShuffle() {
  if (isShuffled()) {
    let originalIndex = 0;

    const playingItem = getPlayingItem();

    const newQueue = originalQueue;
    if (playingItem) {
      originalIndex = getPosition(newQueue, playingItem);
    }

    originalQueue = null;
    await setQueueItems(newQueue, originalIndex);
  }
}

export function isShuffled() {
  return originalQueue !== null;
}

export function getQueueItems() {
  return MusicKit.getInstance().player.queue.items;
}

export async function setQueueItems(items, index) {
  await MusicKit.getInstance().setQueue({
    startPosition: index,
    items: items.map(createMediaItem),
  });
}

function isSame(a, b) {
  return (
    a &&
    b &&
    (a.id === b.id ||
      (b.container && a.id === b.container.id) ||
      (a.container && b.id === a.container.id))
  );
}

export function isCurrentSong(song) {
  const playing = getPlayingItem();

  if (!playing) {
    return false;
  }

  return isSame(song, playing);
}

export function isSongPlaying(song) {
  return MusicKit.getInstance().player.isPlaying && isCurrentSong(song);
}