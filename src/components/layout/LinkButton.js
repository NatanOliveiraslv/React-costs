import { Link } from 'react-router-dom';
import style from './LinkButton.module.css';

const LinkButton = ({to , text}) => {
    return(
        <Link className={style.btn} to={to}>
            {text}
        </Link>
    )
}

export default LinkButton;