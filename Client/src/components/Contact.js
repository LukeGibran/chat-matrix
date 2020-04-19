/* eslint-disable  */
import React, { Component } from "react";
import { Form, Row, Col, Button, Alert, Container } from "react-bootstrap";
import axios from "axios";
import utils from "./common/utils";

class Contact extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isSending: false,
      isSent: false,
      errors: []
    };
  }

  handleSubmit = async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    this.setState({ isSending: true });

    await axios
      .post(`${utils.serverURL}/l/links/contact`, {
        name: formData.get("name"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message")
      })
      .then(response => {
        if (response.data === "Message sent") {
          form.reset();
          this.setState({ isSent: true });

          setTimeout(() => {
            this.setState({ isSent: false });
            this.props.history.push("/"); // Redirect to home page after sending message
          }, 1000);
        } else {
          this.setState({ errors: response.data });
          const { errors } = this.state;
          let time = errors.length * 3000;
          setTimeout(() => {
            this.setState({ errors: [] });
          }, time);
        }
      })
      .catch(error => console.log(error))
      .finally(() => this.setState({ isSending: false }));
  };

  showContactForm() {
    const { isSending, isSent, errors } = this.state;

    if (errors.length > 0) {
      return errors.map((error, i) => {
        return (
          <Alert key={i} variant="danger">
            {error.msg}
          </Alert>
        );
      });
    }

    if (isSent) {
      return (
        <Row className="h-100 justify-content-center align-items-center">
          <Col className="text-center" md={12}>
            <Alert variant="success">Message Sent</Alert>
          </Col>
        </Row>
      );
    }

    return (
      <Form className="mt-5" onSubmit={this.handleSubmit}>
        <Form.Group as={Col}>
          <Form.Label>
            <strong>Your Name</strong>
          </Form.Label>
          <Form.Control
            id="name"
            name="name"
            placeholder="Name"
            disabled={isSending}
          />
        </Form.Group>

        <Form.Group as={Col}>
          <Form.Label>
            <strong>Email</strong>
          </Form.Label>
          <Form.Control
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            disabled={isSending}
          />
        </Form.Group>

        <Form.Group as={Col}>
          <Form.Label>
            <strong>Subject</strong>
          </Form.Label>
          <Form.Control
            id="subject"
            name="subject"
            as="select"
            disabled={isSending}
          >
            <option defaultValue disabled>Select an action</option>
            <option>Comments and suggestions</option>
            <option>Business enquiries</option>
          </Form.Control>
        </Form.Group>

        <Form.Group as={Col}>
          <Form.Label>
            <strong>Message</strong>
          </Form.Label>
          <Form.Control
            id="message"
            name="message"
            as="textarea"
            placeholder="Message"
            disabled={isSending}
          />
        </Form.Group>

        <Form.Group className="pl-3">
          <Button type="submit" disabled={isSending}>
            {isSending ? "Sending..." : "Send Message"}
          </Button>
        </Form.Group>
      </Form>
    );
  }
  render() {
    return <Container className="h-100">{this.showContactForm()}</Container>;
  }
}

export default Contact;
