import { parse, v4 as uuidv4 } from 'uuid'

import styles from './Project.module.css';

import { useParams } from 'react-router-dom';
import { useState, useEffect, use } from 'react';

import Loading from '../layout/Loading';
import Container from '../layout/Container';
import ProjectForm from '../project/ProjectForm'
import Message from '../layout/Message'
import ServiceForm from '../service/ServiceForm';
import ServiceCard from '../service/ServiceCard';

const Project = () => {

    const { id } = useParams();

    const [project, setProject] = useState([]);
    const [service, setService] = useState([]);
    const [showProjectForm, setShowProjectForm] = useState(false);
    const [showServiceForm, setShowServiceForm] = useState(false);
    const [message, setMessage] = useState()
    const [type, setType] = useState()


    useEffect(() => {
        fetch(`http://localhost:5000/projects/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((resp) => resp.json())
            .then((data) => {
                setProject(data);
                setService(data.services)
            }
            )
            .catch((err) => console.log(err));
    }, [id]);

    function editPost(project) {

        setMessage('')

        if (project.budget < project.cors) {
            setMessage('O orçamento não pode ser menor que o custo do projeto')
            setType('error')
            return false
        }

        fetch(`http://localhost:5000/projects/${project.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(project),
        })
            .then((resp) => resp.json())
            .then((data) => {
                setProject(data)
                setShowProjectForm(false)
                setMessage('Proejto atualizado!')
                setType('success')
            })
            .catch(err => console.log(err))
    }

    function createService(project) {

        const lastService = project.services[project.services.length - 1]

        lastService.id = uuidv4()

        const lastServiceCost = lastService.cost
        const newCost = parseFloat(project.cost) + parseFloat(lastServiceCost)


        if (newCost > parseFloat(project.budget)) {
            setMessage('Orçamento ultrapassado, verifique o valor do serviço')
            setType('error')
            project.services.pop()
            return false
        }

        project.cost = newCost

        fetch(`http://localhost:5000/projects/${project.id}`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(project)
        })
            .then((resp) => resp.json())
            .then((data) => {
                setShowServiceForm(false)
            })
            .catch(err => console.log(err))

    }

    function removeService(id, cost) {

        setMessage('')

        const servicesUpdate = project.services.filter(
            (service) => service.id !== id
        )

        const projectUpdate = project

        projectUpdate.services = servicesUpdate
        projectUpdate.cost = parseFloat(projectUpdate.cost) - parseFloat(cost)

        fetch(`http://localhost:5000/projects/${projectUpdate.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectUpdate)
        })
        .then((resp) => resp.json())
        .then((data) => {
            setProject(projectUpdate)
            setService(servicesUpdate)
            setMessage('Serviço removido com sucesso!')
            setType('success')
        })
        .catch(err => console.log(err))

    }

    function toggleProjectForm() {
        setShowProjectForm(!showProjectForm);
    }

    function toggleServiceForm() {
        setShowServiceForm(!showServiceForm);
    }

    return <>
        {project.name ? (
            <div className={styles.project_details}>
                <Container customClass="column">
                    {message && <Message type={type} msg={message} />}
                    <div className={styles.details_container}>
                        <h1>Projeto: {project.name}</h1>
                        <button className={styles.btn} onClick={toggleProjectForm}>
                            {!showProjectForm ? 'Editar Projeto' : 'Fechar'}
                        </button>
                        {!showProjectForm ? (
                            <div className={styles.project_info}>
                                <p>
                                    <span>
                                        Categoria:
                                    </span> {project.category ? project.category.name : 'Sem categoria'}
                                </p>
                                <p>
                                    <span>Total de Orçamento: </span>
                                    R$ {project.budget}
                                </p>
                                <p>
                                    <span>Total Utilizado: </span>
                                    R$ {project.cost}
                                </p>
                            </div>
                        ) : (
                            <div className={styles.project_info}>
                                <ProjectForm handleSubmit={editPost} btnText="Concluir edição" projectData={project} />
                            </div>
                        )}
                    </div>
                    <div className={styles.service_form_container}>
                        <h2>Adicione um serviço:</h2>
                        <button className={styles.btn} onClick={toggleServiceForm}>
                            {!showServiceForm ? 'Adicionar serviço' : 'Fechar'}
                        </button>
                        <div className={styles.project_info}>
                            {showServiceForm &&
                                (
                                    <ServiceForm
                                        handleSubmit={createService}
                                        btnText="Adicionar serviço"
                                        projectData={project}
                                    />
                                )
                            }
                        </div>
                    </div>
                    <h2>Serviços</h2>
                    <Container customClass="start">
                        {service.length > 0 &&
                            service.map((service) => (
                                <ServiceCard 
                                    id={service.id}
                                    name={service.name}
                                    cost={service.cost}
                                    description={service.description}
                                    key={service.id}
                                    handleRemove={removeService}

                                />
                        ))
                        }

                        {service.length === 0 && <p>Não há serviços cadastrados</p>}
                    </Container>
                </Container>
            </div>
        ) : (
            <Loading />
        )}
    </>
}

export default Project;