import React from "react";
import "../styles/Experience.css";

const Experience = () => {
  return (
    <section id="experience" className="experience">
      <h2>EXPERIENCE</h2>

      <div className="experience-columns">
        <div className="column works-column">
          <h3 className="section-title">WORKS</h3>
          <div className="experience-item">
            <h5>Web Developer Intern</h5>
            <h4>Dinas Perindustrian Perdagangan Kab. Garut</h4>
            <span className="date">August - September 2024</span>
            <ul>
              <li>
                Added a Food Price Information (Bapokting) feature to display
                price conditions in each regional market in Garut Regency.
              </li>
              <li>
                Added access rights to accounts that log into the admin system.
              </li>
              <li>
                This development uses PHP with the CodeIgniter 2 framework and a
                MySQL database.
              </li>
              <li>
                <a className="link-credensial" href="http://bapokting.disperindag.garutkab.go.id/Bapokting" target="blank">Visit Site&#8599;</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="column professional-column">
          <h3 className="section-title">PROFESSIONAL</h3>
          <div className="experience-item">
            <h5>Machine Learning Specialization</h5>
            <h4>Bangkit Academy by Google GoTo Tokopedia Traveloka</h4>
            <span className="date">February - June 2024</span>
            <ul>
              <li>
                Completed an intensive 900+ hour program focused on Machine
                Learning, including Deep Learning, Natural Language Processing,
                and TensorFlow.
              </li>
              <li>
                Designed and trained an image classification model using the
                MobileNetv2 CNN architecture with TensorFlow and Keras.
              </li>
              <li>
                Converted and optimized the trained model to TensorFlow Lite
                (TFLite) format for implementation on mobile devices.
              </li>
              <li>
                Collaborated with the Cloud Computing and Mobile Development teams
                for model integration via APIs.
              </li>
            </ul>
          </div>

          <div className="experience-item">
            <h5>Information Technology Staff</h5>
            <h4>Himpunan Mahasiswa Teknik Informatika ITG</h4>
            <span className="date">2021 - 2024</span>
            <ul>
              <li>
                Contributed to the development and maintenance of the Himpunan
                internal website using React.js.
              </li>
              <li>Held Machine Learning training for new students.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
