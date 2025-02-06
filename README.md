To get header and footer put div id="header" at the top of the body and div id="footer" at the bottom of the body in the html
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
