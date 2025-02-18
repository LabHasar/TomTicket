/* eslint-disable */
"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import { Stack, Card, CardContent, Typography } from "@mui/material";
import useSWR from "swr";
import axios from "axios";

const fetcher = async (url: string) => {
  const response = await axios.get(url);
  return response.data.tickets;
};

interface Chamado {
  protocol: string;
  subject: string;
  situation?: {
    id: number;
    description?: string;
  };
}

export default function Home() {
  const { data: todosChamados } = useSWR<Chamado[]>(
    "http://api-tomticket.hasarbrasil.com.br/buscarchamado",
    fetcher,
    { refreshInterval: 5000 }
  );
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [updatedCards, setUpdatedCards] = useState<Set<string>>(new Set());
  const prevDataRef = useRef<unknown[]>([]); // Para armazenar os dados anteriores

  // Filtros para os chamados
  const chamadosFiltrados = (todosChamados || []).filter(
    (chamado: Chamado) => chamado.situation?.id === 1
  );
  
  const chamadosNaoVinculados = (todosChamados || []).filter(
    (chamado: Chamado) => chamado.situation?.id === 0
  );
  
  const chamadosRespondidosAtendente = (todosChamados || []).filter(
    (chamado: Chamado) => chamado.situation?.id === 2
  );
  
  const chamadosRespondidosCliente = (todosChamados || []).filter(
    (chamado: Chamado) => chamado.situation?.id === 3
  );

  // Detecta movimentações nos dados
  useEffect(() => {
    const prevData = prevDataRef.current;

    const hasNewData = (current: unknown[], previous: unknown[]) =>
      current.length > previous.length;

    const newUpdatedCards = new Set<string>();
    if (hasNewData(chamadosFiltrados, prevData)) newUpdatedCards.add("abertos");
    if (hasNewData(chamadosNaoVinculados, prevData))
      newUpdatedCards.add("naoVinculados");
    if (hasNewData(chamadosRespondidosAtendente, prevData))
      newUpdatedCards.add("respondidosHasar");
    if (hasNewData(chamadosRespondidosCliente, prevData))
      newUpdatedCards.add("respondidosCliente");

    if (newUpdatedCards.size > 0) {
      setUpdatedCards(newUpdatedCards);

      // Limpa os destaques após 2 segundos
      const timer = setTimeout(() => setUpdatedCards(new Set()), 2000);
      return () => clearTimeout(timer);
    }

    // Atualiza os dados anteriores
    prevDataRef.current = todosChamados || [];
  }, [todosChamados]);

  const isUpdated = (key: string) => updatedCards.has(key);
  
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const scrollContainer = scrollRef.current;

    if (!scrollContainer) return;

    const animateScroll = () => {
      scrollContainer.scrollTop += 1; // Rola para baixo
      if (scrollContainer.scrollTop >= scrollContainer.scrollHeight / 2) {
        scrollContainer.scrollTop = 0; // Reinicia a rolagem
      }
      requestAnimationFrame(animateScroll); // Chama a animação novamente
    };

    animateScroll(); // Inicia a animação

    return () => {
      // Limpeza se necessário
    };
  }, [chamadosFiltrados]);
  /* eslint-enable react-hooks/exhaustive-deps */

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Stack direction="row" alignItems="center" justifyContent="center">
          <Image
            src="/images/logo-login1.png"
            alt="Logo"
            width={150}
            height={110}
          />
        </Stack>
      </div>

      <div className={styles.cardsContainer}>
        <div style={{ display: "flex", gap: "5%", margin: "2%" }}>
          <Card
            className={`${styles.card} ${isUpdated("abertos") ? styles.blink : ""}`}
            style={{ backgroundColor: "#D0E6A5", flex: 1 }}
          >
            <CardContent>
              <Typography variant="h6">Chamados Abertos</Typography>
              <Typography variant="h4">{chamadosFiltrados.length}</Typography>
            </CardContent>
          </Card>

          <Card
            className={`${styles.card} ${isUpdated("naoVinculados") ? styles.blink : ""}`}
            style={{ backgroundColor: "#FFCCCB", flex: 1 }}
          >
            <CardContent>
              <Typography variant="h6">Chamados Não Vinculados</Typography>
              <Typography variant="h4">{chamadosNaoVinculados.length}</Typography>
            </CardContent>
          </Card>

          <Card
            className={`${styles.card} ${isUpdated("respondidosHasar") ? styles.blink : ""}`}
            style={{ backgroundColor: "#ADD8E6", flex: 1 }}
          >
            <CardContent>
              <Typography variant="h6">Chamados Respondidos Hasar</Typography>
              <Typography variant="h4">{chamadosRespondidosAtendente.length}</Typography>
            </CardContent>
          </Card>

          <Card
            className={`${styles.card} ${isUpdated("respondidosCliente") ? styles.blink : ""}`}
            style={{ backgroundColor: "#FDE68A", flex: 1 }}
          >
            <CardContent>
              <Typography variant="h6">Chamados Respondidos Cliente</Typography>
              <Typography variant="h4">{chamadosRespondidosCliente.length}</Typography>
            </CardContent>
          </Card>
        </div>

        <div className={styles.scrollContainer} ref={scrollRef}>
          <div className={styles.scrollContent}>
            {chamadosFiltrados.concat(chamadosFiltrados).map((chamado: Chamado, index: React.Key | null | undefined)  => (
              <Card
                key={index}
                className={styles.card}
                style={{ marginBottom: "10px" }}
              >
                <CardContent>
                  <Typography variant="h6" component="div">
                    #{chamado.protocol} - {chamado.subject}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Situação: {chamado.situation?.description || "Indisponível"}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
