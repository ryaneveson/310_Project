To get header and footer put <div id="header"></div> at the top of the body and <div id="footer"></div> at the bottom of the body
Then put the following code in the js file: 
import HeaderLoader from './Header'; 
import FooterLoader from './Footer';
const headerElement = document.getElementById('header');
if (headerElement) {
  const headerRoot = ReactDOM.createRoot(headerElement);
  headerRoot.render(
    <React.StrictMode>
      <HeaderLoader />
    </React.StrictMode>
  );
}
const footerElement = document.getElementById('footer');
if (footerElement) {
  const footerRoot = ReactDOM.createRoot(footerElement);
  footerRoot.render(
    <React.StrictMode>
      <FooterLoader />
    </React.StrictMode>
  );
}
