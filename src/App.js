import { useEffect, useRef } from 'react';
import './App.css';
import WebViewer from '@pdftron/webviewer';

function App() {
  const viewer = useRef(null);
  const socket = useRef(null);
  const wvInstance = useRef(null);
  const documentId = "sample.pdf";

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

      annotationManager.addEventListener("annotationChanged", (annotations, action, info) => {
        if(info.imported){
          return;
        }
        
        if (action === "add" || action === "modify" || action === "delete") {
          annotationManager.exportAnnotationCommand().then((xfdfString) => {
            socket.current.send(JSON.stringify({xfdf: xfdfString, documentId: documentId}));
          });
        }
      });

    });
  }, []);

  useEffect(() => {
    socket.current = new WebSocket("ws://localhost:8080");
    
    // Listen for messages
    socket.current.addEventListener("message", async (event) => {
      const data = JSON.parse(event.data);

      const annotations = await wvInstance.current.Core.annotationManager.importAnnotationCommand(data.xfdf);
      await wvInstance.current.Core.annotationManager.drawAnnotationsFromList(annotations);
    });

  },[])


  return (
    <div className="App">
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
}

export default App;
