import React, { useState, useEffect, useRef } from 'react';
import '../styles/AudioPlayer.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp, faRemove, faSortDown, faSortUp, faTrash, faTrashArrowUp, faTrashCan, faUpload } from '@fortawesome/free-solid-svg-icons';
import { primaryColor } from '../values/colors';

const AudioPlayer = () => {
  const [playlist, setPlaylist] = useState([]);
  let selectedSongs = useRef(localStorage.getItem('selectedSongs')? JSON.parse(localStorage.getItem('selectedSongs')):[]);
  const [filteredPlaylist, setFilteredPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(JSON.parse(localStorage.getItem('currentTrackIndex'))||0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [db, setDB] = useState(null);
  const audioRef = useRef(new Audio());
  const [loading, setLoading] = useState(true);

  console.log(selectedSongs.current);

  useEffect(() => {
    const request = indexedDB.open('audio_files_database', 1);

    request.onupgradeneeded = function(event) {
      const db = event.target.result;
      db.createObjectStore('audio_files', { autoIncrement: true });
    };

    request.onerror = function(event) {
      console.error('IndexedDB error:', event.target.errorCode);
    };

    request.onsuccess = function(event) {
      setDB(event.target.result);
      loadPlaylistFromDB(event.target.result);
    };
  }, []);

  useEffect(() => {
    if (db) {
      storePlaylistInDB(db);
      setFilteredPlaylist(selectedSongs.current.map((songIndex) => playlist[songIndex]));
    } 
  }, [playlist]);

  useEffect(() => {
    localStorage.setItem('currentTrackIndex', JSON.stringify(currentTrackIndex));
  }, [currentTrackIndex]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem('lastPosition', JSON.stringify(audioRef.current.currentTime));
    };

    window.addEventListener('unload', handleBeforeUnload);

    return () => {
      window.removeEventListener('unload', handleBeforeUnload);
    };
  }, []);

  useEffect(()=>{
    const lastPosition = JSON.parse(localStorage.getItem('lastPosition')) || 0;
    if(audioRef.current) audioRef.current.currentTime = lastPosition ;
  })

  const loadPlaylistFromDB = (db) => {
    const transaction = db.transaction(['audio_files'], 'readonly');
    const store = transaction.objectStore('audio_files');
    const request = store.getAll();

    request.onsuccess = function(event) {
      const files = event.target.result;
      setPlaylist(files);
      if (selectedSongs.current.length<=0) selectedSongs.current = Array.from({ length: files.length }, (_, index) => index);
      localStorage.setItem("selectedSongs", JSON.stringify(selectedSongs.current));
      setFilteredPlaylist(selectedSongs.current.map((songindex)=> files[songindex]));

      const lastTrackIndex = JSON.parse(localStorage.getItem('currentTrackIndex')) || 0;
      setCurrentTrackIndex(lastTrackIndex);

      const lastPosition = JSON.parse(localStorage.getItem('lastPosition')) || 0;
      if(audioRef.current) audioRef.current.currentTime = lastPosition ;

      setLoading(false);

    };
  };



  const storePlaylistInDB = (db) => {
    const transaction = db.transaction(['audio_files'], 'readwrite');
    const store = transaction.objectStore('audio_files');
    store.clear();
    playlist.forEach(file => {
      store.add(file);
    });
  };

  const handleDeleteSongFromDB = (index) => {
    if (db) {
      const transaction = db.transaction(['audio_files'], 'readwrite');
      const store = transaction.objectStore('audio_files');
      const request = store.getAll();
      
      request.onsuccess = function(event) {

        // Remove the song from selectedSongs if it's present
        selectedSongs.current = selectedSongs.current.filter((songIndex) => songIndex !== index);
        for (const i in selectedSongs.current) {
          if(selectedSongs.current[i]>index){
            selectedSongs.current[i] -= 1;
          }
        }
        localStorage.setItem('selectedSongs', JSON.stringify(selectedSongs.current));

        //Update last position to 0
        if(currentTrackIndex==index){
          localStorage.setItem('lastPosition', 0);
        }else{
          localStorage.setItem('lastPosition', JSON.stringify(audioRef.current.currentTime));
        }
        //Update currentIndex if the song deleted is before the current playing song
        if(currentTrackIndex>=index){
          if(selectedSongs.current.length>0){
            if(currentTrackIndex>=selectedSongs.current.length) 
            {
              setCurrentTrackIndex(currentTrackIndex-1);
            };
          }else{
            setCurrentTrackIndex(0);
          }
          // setIsPlaying(false);
        }
        
        // Remove the song at the specified index from the playlist
        const updatedPlaylist = [...playlist];
        updatedPlaylist.splice(index, 1);
        setPlaylist(updatedPlaylist);

        // Clear the store and add the updated playlist
        store.clear();
        updatedPlaylist.forEach((file) => {
          store.add(file);
        });

        loadPlaylistFromDB(db);
  
        // Update the filteredPlaylist
        // setFilteredPlaylist(selectedSongs.current.map((songIndex) => updatedPlaylist[songIndex]));


        
      };
    }
  };
  

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setPlaylist([...playlist, ...files]);
  };

  const handleAddSong = (index) => {
    if(!selectedSongs.current.includes(index)){
      selectedSongs.current = [...selectedSongs.current, index]
      localStorage.setItem("selectedSongs", JSON.stringify(selectedSongs.current));
      console.log(selectedSongs.current)
      localStorage.setItem('lastPosition', JSON.stringify(audioRef.current.currentTime));
      setFilteredPlaylist(selectedSongs.current.map((songindex)=> playlist[songindex]));
    }
  }

  const handleRemoveSong = (indx) => {
    selectedSongs.current = selectedSongs.current.filter((_, index)=> index!=indx);
    localStorage.setItem('lastPosition', JSON.stringify(audioRef.current.currentTime));
    if(currentTrackIndex>=selectedSongs.current.length){
      setCurrentTrackIndex((prev)=> prev-1>0 ? prev-1 : 0);
    }
    localStorage.setItem("selectedSongs", JSON.stringify(selectedSongs.current));
    setFilteredPlaylist(selectedSongs.current.map((songindex)=> playlist[songindex]))
  }

  const handleMoveUp = (index) => {

      const temp = selectedSongs.current[index-1];
      selectedSongs.current[index-1] = selectedSongs.current[index];
      selectedSongs.current[index] = temp;
      console.log(selectedSongs.current);
      localStorage.setItem("selectedSongs", JSON.stringify(selectedSongs.current));
      if(index == currentTrackIndex){
        setCurrentTrackIndex(index-1);
      }else if(index-1 == currentTrackIndex){
        setCurrentTrackIndex(index);
      }
      setFilteredPlaylist(selectedSongs.current.map((songindex)=> playlist[songindex]))
      localStorage.setItem('lastPosition', JSON.stringify(audioRef.current.currentTime));

  }

  const handleMoveDown = (index) => {
    
      const temp = selectedSongs.current[index+1];
      selectedSongs.current[index+1] = selectedSongs.current[index];
      selectedSongs.current[index] = temp;
      console.log(selectedSongs.current);
      localStorage.setItem("selectedSongs", JSON.stringify(selectedSongs.current));
      if(index == currentTrackIndex){
        setCurrentTrackIndex(index+1);
      }else if(index+1 == currentTrackIndex){
        setCurrentTrackIndex(index);
      }
      setFilteredPlaylist(selectedSongs.current.map((songindex)=> playlist[songindex]))
      localStorage.setItem('lastPosition', JSON.stringify(audioRef.current.currentTime));
    
  }


  const handlePlay = (index) => {
    setCurrentTrackIndex(index);
    localStorage.setItem('lastPosition', 0);
    setIsPlaying(true);
  };

  const handleTrackEnded = () => {
    console.log("Track ended",  (currentTrackIndex + 1) % (selectedSongs.current.length));
    localStorage.setItem('lastPosition', 0);
    setCurrentTrackIndex((currentTrackIndex + 1) % (selectedSongs.current.length));
    setIsPlaying(true);
  };

  return (
    <div className='main-container'>
      <div className='songs-container'>
        <div className='file-input'>
          <label htmlFor="song"><FontAwesomeIcon icon={faUpload}/> &nbsp; Upload Songs</label>
          <input id="song" type="file" accept=".mp3" onChange={handleFileChange} multiple style={{display:'none'}}/>
        </div>
        <div>
          <h2>Song List <br/><span style={{fontSize:'12px', color:'grey'}}>Click on song to add it to playlist</span></h2>
          <div className="playlist">
            {playlist.map((track, index) => (
              <div key={index} style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:'15px'}}>
                <button onClick={() => handleAddSong(index)} title='Add to playlist'>{track.name}</button>
                <FontAwesomeIcon className="fa-icon" icon={faTrash} color={primaryColor} onClick={()=>handleDeleteSongFromDB(index)} />
              </div>
            ))}
          </div>
          </div>
      </div>
    
      {playlist.length > 0 &&(
        <div  className="audio-player-container">
          {/* {console.log(playlist[selectedSongs.current[currentTrackIndex]])} */}
          <h2>Now Playing</h2>
          <audio 
            ref={audioRef}
            controls
            autoPlay={isPlaying} 
            src={playlist[selectedSongs.current[currentTrackIndex]] ? URL.createObjectURL(playlist[selectedSongs.current[currentTrackIndex]]) : ''}
            onPause={()=> 
              {
                console.log('lastPosition', audioRef.current.currentTime);
                localStorage.setItem('lastPosition', JSON.stringify(audioRef.current.currentTime));
                // audioRef.current.removeEventListener('ended', handleTrackEnded);
              }
            }
            onPlay={()=>{
              audioRef.current.addEventListener('ended', handleTrackEnded);
            }}
          />
          <div  className="playlist">
            {filteredPlaylist.length>0 && filteredPlaylist.map((track, index) => (
              <div  key={index} style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:'15px'}}>
                {console.log('currentTrackIndex', currentTrackIndex)}
                {console.log('index', index)}
                  <button onClick={() => handlePlay(index)} className={`${currentTrackIndex==index ? 'activeSong' : ''}`} title='Play Song'>
                      {track.name}
                  </button>
                  <FontAwesomeIcon className="fa-icon" icon={faRemove} size='lg' color={primaryColor} onClick={()=>handleRemoveSong(index)} />
                  <FontAwesomeIcon className="fa-icon" icon={faArrowUp}  color={index>0 ? primaryColor : 'grey'} onClick={()=> index>0 && handleMoveUp(index)}/>
                  <FontAwesomeIcon className="fa-icon" icon={faArrowDown} color={index<(filteredPlaylist.length-1) ? primaryColor : 'grey'} onClick={()=> index<(filteredPlaylist.length-1) && handleMoveDown(index)}/>
              </div>
            ))}
          </div>
        </div>
      )}
    
    </div>
  );
};

export default AudioPlayer;
