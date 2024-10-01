import { useEffect, useRef } from 'react';
import './App.css';
import WebViewer from '@pdftron/webviewer';

function App() {
  const viewer = useRef(null);
  const socket = useRef(null);
  const wvInstance = useRef(null);

  useEffect(() => {
    WebViewer(
      {
        path: '/webviewer/lib',
        initialDoc: '/files/sample.pdf',
      },
      viewer.current,
    ).then((instance) => {
      wvInstance.current = instance; 

      const {annotationManager} = instance.Core;

      annotationManager.addEventListener("annotationChanged", (annotations, action) => {
        if (action === "add" || action === "modify" || action === "delete") {
          annotationManager.exportAnnotationCommand().then((xfdfString) => {
            socket.current.send(xfdfString);
          });
        }
      });

    });
  }, []);

  useEffect(() => {
    socket.current = new WebSocket("ws://localhost:8080");

    socket.current.addEventListener("open", event => {
      socket.current.send("Connection established")
    });
    
    // Listen for messages
    socket.current.addEventListener("message", event => {
      wvInstance.current.Core.annotationManager.importAnnotationCommand(event.data);
      wvInstance.current.Core.documentViewer.refreshAll();
      wvInstance.current.Core.documentViewer.updateView();
    });

  },[])


  return (
    <div className="App">
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
}

export default App;
